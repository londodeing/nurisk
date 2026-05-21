import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/emergency_mode_provider.dart';

/// Emergency mode activation button
/// - 3-second hold to activate
/// - Haptic feedback
/// - Visible on every screen
class EmergencyModeButton extends StatefulWidget {
  final bool showDeactivateOption;

  const EmergencyModeButton({
    super.key,
    this.showDeactivateOption = true,
  });

  @override
  State<EmergencyModeButton> createState() => _EmergencyModeButtonState();
}

class _EmergencyModeButtonState extends State<EmergencyModeButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<Color?> _colorAnimation;

  bool _isHolding = false;
  double _holdProgress = 0.0;
  static const int _holdDurationMs = 3000;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: _holdDurationMs),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _colorAnimation = ColorTween(
      begin: Colors.red,
      end: Colors.yellow,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _controller.addListener(() {
      setState(() {
        _holdProgress = _controller.value;
      });
    });

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _activate();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _activate() async {
    final provider = context.read<EmergencyModeProvider>();
    await provider.activate(source: EmergencyTriggerSource.manual);

    // Play confirmation sound
    await SystemSound.play(SystemSoundType.alert);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('EMERGENCY MODE ACTIVATED'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _onLongPressStart(LongPressStartDetails details) {
    setState(() {
      _isHolding = true;
    });
    _controller.forward();
  }

  void _onLongPressEnd(LongPressEndDetails details) {
    setState(() {
      _isHolding = false;
      _holdProgress = 0.0;
    });
    _controller.reset();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<EmergencyModeProvider>(
      builder: (context, provider, child) {
        // Show deactivate option if already active
        if (provider.isActive && widget.showDeactivateOption) {
          return FloatingActionButton.extended(
            onPressed: () => provider.deactivate(),
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            icon: const Icon(Icons.stop_circle),
            label: const Text('DEACTIVATE'),
          );
        }

        // Hold-to-activate button
        return GestureDetector(
          onLongPressStart: _onLongPressStart,
          onLongPressEnd: _onLongPressEnd,
          child: FloatingActionButton.extended(
            onPressed: null, // Disabled - must hold
            backgroundColor: _isHolding ? _colorAnimation.value : Colors.red,
            foregroundColor: Colors.white,
            icon: _isHolding
                ? Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: _holdProgress,
                        backgroundColor: Colors.white24,
                        color: Colors.white,
                        strokeWidth: 3,
                      ),
                      const Icon(Icons.warning, size: 20),
                    ],
                  )
                : const Icon(Icons.emergency),
            label: Text(_isHolding ? 'HOLD...' : 'EMERGENCY'),
          ),
        );
      },
    );
  }
}

/// Emergency mode indicator bar
/// Shows at top of screen when active
class EmergencyModeIndicator extends StatelessWidget {
  const EmergencyModeIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<EmergencyModeProvider>(
      builder: (context, provider, child) {
        if (!provider.isActive) {
          return const SizedBox.shrink();
        }

        final duration = provider.state.activatedAt != null
            ? DateTime.now().difference(provider.state.activatedAt!)
            : Duration.zero;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          color: Colors.red,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.warning,
                color: Colors.yellow,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'EMERGENCY MODE ACTIVE',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: 16),
              Text(
                _formatDuration(duration),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.yellow,
                    ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }
}
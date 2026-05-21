import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Giant button component for emergency use
/// - Minimum 80px height
/// - High-contrast variants
/// - Tactile feedback
class GiantButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final IconData? icon;
  final GiantButtonVariant variant;
  final bool isLoading;
  final bool isDisabled;

  const GiantButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.variant = GiantButtonVariant.primary,
    this.isLoading = false,
    this.isDisabled = false,
  });

  @override
  State<GiantButton> createState() => _GiantButtonState();
}

class _GiantButtonState extends State<GiantButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _colorAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _colorAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _isPressed = true);
    _controller.forward();
    HapticFeedback.mediumImpact();
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  void _handleTapCancel() {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final colors = _getColors(context);
    final isDisabled = widget.isDisabled || widget.isLoading;

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      onTap: isDisabled ? null : widget.onPressed,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              constraints: const BoxConstraints(
                minHeight: 80,
                minWidth: double.infinity,
              ),
              decoration: BoxDecoration(
                color: isDisabled
                    ? colors.disabledColor
                    : Color.lerp(
                        colors.baseColor,
                        colors.pressedColor,
                        _colorAnimation.value,
                      ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDisabled
                      ? colors.disabledBorder
                      : colors.borderColor,
                  width: 3,
                ),
                boxShadow: _isPressed
                    ? []
                    : [
                        BoxShadow(
                          color: colors.shadowColor,
                          offset: const Offset(0, 4),
                          blurRadius: 8,
                        ),
                      ],
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 20,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (widget.isLoading)
                    SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        color: colors.textColor,
                      ),
                    )
                  else if (widget.icon != null)
                    Icon(
                      widget.icon,
                      size: 28,
                      color: colors.textColor,
                    ),
                  if (widget.icon != null || widget.isLoading)
                    const SizedBox(width: 12),
                  Text(
                    widget.label,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: colors.textColor,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  _GiantButtonColors _getColors(BuildContext context) {
    switch (widget.variant) {
      case GiantButtonVariant.primary:
        return _GiantButtonColors(
          baseColor: Theme.of(context).colorScheme.primary,
          pressedColor: Theme.of(context).colorScheme.primary.withOpacity(0.7),
          disabledColor: Colors.grey[400]!,
          textColor: Colors.white,
          borderColor: Colors.black,
          disabledBorder: Colors.grey[300]!,
          shadowColor: Colors.black38,
        );
      case GiantButtonVariant.danger:
        return _GiantButtonColors(
          baseColor: Colors.red[700]!,
          pressedColor: Colors.red[900]!,
          disabledColor: Colors.grey[400]!,
          textColor: Colors.white,
          borderColor: Colors.red[900]!,
          disabledBorder: Colors.grey[300]!,
          shadowColor: Colors.red[900]!.withOpacity(0.5),
        );
      case GiantButtonVariant.warning:
        return _GiantButtonColors(
          baseColor: Colors.yellow[700]!,
          pressedColor: Colors.yellow[900]!,
          disabledColor: Colors.grey[400]!,
          textColor: Colors.black,
          borderColor: Colors.black,
          disabledBorder: Colors.grey[300]!,
          shadowColor: Colors.yellow[700]!.withOpacity(0.5),
        );
      case GiantButtonVariant.success:
        return _GiantButtonColors(
          baseColor: Colors.green[700]!,
          pressedColor: Colors.green[900]!,
          disabledColor: Colors.grey[400]!,
          textColor: Colors.white,
          borderColor: Colors.black,
          disabledBorder: Colors.grey[300]!,
          shadowColor: Colors.green[700]!.withOpacity(0.5),
        );
      case GiantButtonVariant.inverse:
        return _GiantButtonColors(
          baseColor: Colors.black,
          pressedColor: Colors.grey[800]!,
          disabledColor: Colors.grey[400]!,
          textColor: Colors.yellow,
          borderColor: Colors.yellow,
          disabledBorder: Colors.grey[300]!,
          shadowColor: Colors.black,
        );
    }
  }
}

class _GiantButtonColors {
  final Color baseColor;
  final Color pressedColor;
  final Color disabledColor;
  final Color textColor;
  final Color borderColor;
  final Color disabledBorder;
  final Color shadowColor;

  _GiantButtonColors({
    required this.baseColor,
    required this.pressedColor,
    required this.disabledColor,
    required this.textColor,
    required this.borderColor,
    required this.disabledBorder,
    required this.shadowColor,
  });
}

/// Giant button variants
enum GiantButtonVariant {
  primary,
  danger,
  warning,
  success,
  inverse,
}

/// Giant button grid for emergency actions
/// - Max 2 columns
/// - 16px minimum spacing
/// - Prevents pinch zoom
class GiantButtonGrid extends StatelessWidget {
  final List<GiantButtonGridItem> items;
  final int columns;
  final double spacing;

  const GiantButtonGrid({
    super.key,
    required this.items,
    this.columns = 2,
    this.spacing = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
        children: [
          for (var i = 0; i < items.length; i += columns)
            Padding(
              padding: EdgeInsets.only(bottom: spacing),
              child: Row(
                children: [
                  for (var j = i;
                      j < i + columns && j < items.length;
                      j++)
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(
                          left: j > i ? spacing : 0,
                        ),
                        child: items[j].build(context),
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Grid item for GiantButtonGrid
class GiantButtonGridItem {
  final String label;
  final IconData? icon;
  final VoidCallback onPressed;
  final GiantButtonVariant variant;
  final bool isLoading;
  final bool isDisabled;

  const GiantButtonGridItem({
    required this.label,
    this.icon,
    required this.onPressed,
    this.variant = GiantButtonVariant.primary,
    this.isLoading = false,
    this.isDisabled = false,
  });

  Widget build(BuildContext context) {
    return GiantButton(
      label: label,
      icon: icon,
      onPressed: onPressed,
      variant: variant,
      isLoading: isLoading,
      isDisabled: isDisabled,
    );
  }
}
import 'package:flutter/material.dart';
import '../widgets/giant_button.dart';

/// Demo screen for giant button layout
class GiantButtonDemoScreen extends StatelessWidget {
  const GiantButtonDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Giant Buttons'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Primary buttons
              const Text(
                'Primary Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'LAPOR BANJIR',
                icon: Icons.warning,
                onPressed: () {},
              ),
              const SizedBox(height: 16),

              // Danger buttons
              const Text(
                'Danger Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'PANIC SOS',
                icon: Icons.sos,
                variant: GiantButtonVariant.danger,
                onPressed: () {},
              ),
              const SizedBox(height: 16),

              // Warning buttons
              const Text(
                'Warning Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'PERINGATAN',
                icon: Icons.warning_amber,
                variant: GiantButtonVariant.warning,
                onPressed: () {},
              ),
              const SizedBox(height: 16),

              // Inverse buttons
              const Text(
                'Inverse (High Contrast)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'DARURAT',
                icon: Icons.emergency,
                variant: GiantButtonVariant.inverse,
                onPressed: () {},
              ),
              const SizedBox(height: 16),

              // Success buttons
              const Text(
                'Success Actions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'KONFIRMASI',
                icon: Icons.check_circle,
                variant: GiantButtonVariant.success,
                onPressed: () {},
              ),
              const SizedBox(height: 16),

              // Disabled state
              const Text(
                'Disabled State',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'DISABLED',
                icon: Icons.block,
                onPressed: () {},
                isDisabled: true,
              ),
              const SizedBox(height: 16),

              // Loading state
              const Text(
                'Loading State',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButton(
                label: 'SENDING...',
                icon: Icons.send,
                onPressed: () {},
                isLoading: true,
              ),
              const SizedBox(height: 32),

              // Button grid
              const Text(
                'Button Grid (2 Columns)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButtonGrid(
                items: [
                  GiantButtonGridItem(
                    label: 'Lapor',
                    icon: Icons.add_alert,
                    onPressed: () {},
                  ),
                  GiantButtonGridItem(
                    label: 'Peta',
                    icon: Icons.map,
                    onPressed: () {},
                  ),
                  GiantButtonGridItem(
                    label: 'Suara',
                    icon: Icons.mic,
                    onPressed: () {},
                  ),
                  GiantButtonGridItem(
                    label: 'Profil',
                    icon: Icons.person,
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Emergency grid
              const Text(
                'Emergency Grid',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              GiantButtonGrid(
                items: [
                  GiantButtonGridItem(
                    label: 'PANIC',
                    icon: Icons.sos,
                    variant: GiantButtonVariant.danger,
                    onPressed: () {},
                  ),
                  GiantButtonGridItem(
                    label: 'Lapor',
                    icon: Icons.warning,
                    variant: GiantButtonVariant.warning,
                    onPressed: () {},
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
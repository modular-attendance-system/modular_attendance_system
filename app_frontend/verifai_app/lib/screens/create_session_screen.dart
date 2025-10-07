import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:verifai_app/logic/providers.dart';
import 'package:verifai_app/widgets/create_session/step1_basic_info.dart';
import 'package:verifai_app/widgets/create_session/step2_attendee_properties.dart';
import 'package:verifai_app/widgets/create_session/step3_select_modules.dart';
import 'package:verifai_app/widgets/create_session/step4_configure_modules.dart';
import 'package:verifai_app/widgets/create_session/step5_aggregation_logic.dart';
import 'package:verifai_app/widgets/create_session/step6_review_create.dart';

class CreateSessionScreen extends ConsumerStatefulWidget {
  const CreateSessionScreen({super.key});

  @override
  ConsumerState<CreateSessionScreen> createState() =>
      _CreateSessionScreenState();
}

class _CreateSessionScreenState extends ConsumerState<CreateSessionScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isCreatingSession = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onStepContinue() {
    if (_currentStep < 5) {
      setState(() => _currentStep++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submitSession();
    }
  }

  void _onStepCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.pop();
    }
  }

  Future<void> _submitSession() async {
    setState(() => _isCreatingSession = true);
    try {
      await ref.read(createSessionControllerProvider.notifier).createSession();
      ref.invalidate(mySessionsProvider); // Refresh the dashboard list
      if (mounted) {
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Session created successfully!'),
              backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(e.toString().replaceFirst('Exception: ', '')),
              backgroundColor: Theme.of(context).colorScheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isCreatingSession = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepTitles = [
      'Info',
      'Properties',
      'Modules',
      'Configure',
      'Logic',
      'Review'
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Session'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding:
                const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
            child: Row(
              children: List.generate(stepTitles.length, (index) {
                return Expanded(
                  child: Column(
                    children: [
                      _buildStepIcon(index),
                      const SizedBox(height: 8),
                      Text(stepTitles[index],
                          style: TextStyle(
                              fontSize: 12,
                              color: index <= _currentStep
                                  ? Colors.white
                                  : Colors.grey)),
                    ],
                  ),
                );
              }),
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: const [
                Step1BasicInfo(),
                Step2AttendeeProperties(),
                Step3SelectModules(),
                Step4ConfigureModules(),
                Step5AggregationLogic(),
                Step6Review(),
              ],
            ),
          ),
          _buildBottomNavBar(),
        ],
      ),
    );
  }

  Widget _buildStepIcon(int index) {
    bool isCompleted = index < _currentStep;
    return CircleAvatar(
      radius: 16,
      backgroundColor: isCompleted
          ? Theme.of(context).primaryColor
          : (_currentStep == index ? Colors.white : Colors.grey.shade800),
      child: isCompleted
          ? const Icon(Icons.check, color: Colors.black, size: 18)
          : Text('${index + 1}',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _currentStep == index
                      ? Colors.black
                      : Colors.grey.shade400)),
    );
  }

  Widget _buildBottomNavBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextButton(onPressed: _onStepCancel, child: Text(_currentStep == 0 ? 'Cancel' : 'Back')),
          ElevatedButton(
            onPressed: _isCreatingSession ? null : _onStepContinue,
            child: _isCreatingSession
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2.5))
                : Text(_currentStep == 5 ? 'Create Session' : 'Next Step'),
          ),
        ],
      ),
    );
  }
}
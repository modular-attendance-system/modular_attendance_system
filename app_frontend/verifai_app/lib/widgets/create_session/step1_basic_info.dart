import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:verifai_app/logic/providers.dart';

// 1. Convert to a ConsumerStatefulWidget
class Step1BasicInfo extends ConsumerStatefulWidget {
  const Step1BasicInfo({super.key});

  @override
  ConsumerState<Step1BasicInfo> createState() => _Step1BasicInfoState();
}

class _Step1BasicInfoState extends ConsumerState<Step1BasicInfo> {
  // 2. Create TextEditingControllers
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;
  final _startDateTimeController = TextEditingController();
  final _endDateTimeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // 3. Initialize controllers with the current state from Riverpod
    final config = ref.read(createSessionControllerProvider);
    _nameController = TextEditingController(text: config.name);
    _descriptionController = TextEditingController(text: config.description);
    if (config.startTime != null) {
      _startDateTimeController.text =
          DateFormat('MM/dd/yyyy hh:mm a').format(config.startTime!);
    }
    if (config.endTime != null) {
      _endDateTimeController.text =
          DateFormat('MM/dd/yyyy hh:mm a').format(config.endTime!);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _startDateTimeController.dispose();
    _endDateTimeController.dispose();
    super.dispose();
  }

  Future<void> _selectDateTime(BuildContext context, bool isStartTime) async {
    final initialDate = isStartTime
        ? ref.read(createSessionControllerProvider).startTime ?? DateTime.now()
        : ref.read(createSessionControllerProvider).endTime ?? DateTime.now();

    final date = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initialDate),
    );
    if (time == null) return;

    final dt =
        DateTime(date.year, date.month, date.day, time.hour, time.minute);
    final formatted = DateFormat('MM/dd/yyyy hh:mm a').format(dt);
    final notifier = ref.read(createSessionControllerProvider.notifier);

    if (isStartTime) {
      _startDateTimeController.text = formatted;
      notifier.updateStartTime(dt);
    } else {
      _endDateTimeController.text = formatted;
      notifier.updateEndTime(dt);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Text('Step 1: Basic Information',
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 32),
          TextFormField(
            // 4. Attach the controller
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Session Name'),
            onChanged: (value) =>
                ref.read(createSessionControllerProvider.notifier).updateName(value),
          ),
          const SizedBox(height: 16),
          TextFormField(
            // 4. Attach the controller
            controller: _descriptionController,
            decoration: const InputDecoration(labelText: 'Description'),
            maxLines: 3,
            onChanged: (value) => ref
                .read(createSessionControllerProvider.notifier)
                .updateDescription(value),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _startDateTimeController,
                  readOnly: true,
                  decoration: const InputDecoration(labelText: 'Start Time'),
                  onTap: () => _selectDateTime(context, true),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  controller: _endDateTimeController,
                  readOnly: true,
                  decoration: const InputDecoration(labelText: 'End Time'),
                  onTap: () => _selectDateTime(context, false),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
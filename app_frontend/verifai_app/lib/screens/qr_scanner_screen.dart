// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:go_router/go_router.dart';
// import 'package:mobile_scanner/mobile_scanner.dart';
// import 'package:verifai_app/logic/providers.dart';

// class QrScannerScreen extends ConsumerStatefulWidget {
//   final String sessionId;
//   const QrScannerScreen({super.key, required this.sessionId});

//   @override
//   ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
// }

// class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
//   final MobileScannerController _scannerController = MobileScannerController();
//   bool _isProcessing = false;

//   @override
//   void dispose() {
//     _scannerController.dispose();
//     super.dispose();
//   }

//   void _handleQRCode(Barcode barcode) async {
//     if (_isProcessing) return;
//     setState(() => _isProcessing = true);

//     final String? code = barcode.rawValue;
//     if (code == null) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text('Could not read QR code.')),
//       );
//       setState(() => _isProcessing = false);
//       return;
//     }

//     try {
//       final repo = ref.read(sessionRepositoryProvider);
//       await repo.submitQrCode(widget.sessionId, code);

//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//             content: Text('Scan Successful! Status updated.'),
//             backgroundColor: Colors.green,
//           ),
//         );
//         context.pop();
//       }
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(
//             content: Text(e.toString()),
//             backgroundColor: Colors.redAccent,
//           ),
//         );
//       }
//     } finally {
//       if (mounted) setState(() => _isProcessing = false);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Scan Session Code'),
//         actions: [
//           // ✅ Torch toggle for mobile_scanner 5.1.1
//           ValueListenableBuilder<TorchState>(
//             valueListenable: _scannerController.torchState,
//             builder: (context, state, child) {
//               final isOn = state == TorchState.on;
//               return IconButton(
//                 icon: Icon(
//                   isOn ? Icons.flash_on : Icons.flash_off,
//                   color: isOn ? Colors.yellow : Colors.grey,
//                 ),
//                 onPressed: () => _scannerController.toggleTorch(),
//               );
//             },
//           ),
//         ],
//       ),
//       body: Stack(
//         alignment: Alignment.center,
//         children: [
//           MobileScanner(
//             controller: _scannerController,
//             onDetect: (capture) {
//               final barcodes = capture.barcodes;
//               if (barcodes.isNotEmpty) _handleQRCode(barcodes.first);
//             },
//           ),
//           Container(
//             width: 280,
//             height: 280,
//             decoration: BoxDecoration(
//               border: Border.all(color: Colors.white.withOpacity(0.5), width: 4),
//               borderRadius: BorderRadius.circular(12),
//             ),
//           ),
//           if (_isProcessing)
//             Container(
//               color: Colors.black.withOpacity(0.7),
//               child: const Center(child: CircularProgressIndicator()),
//             ),
//         ],
//       ),
//     );
//   }
// }

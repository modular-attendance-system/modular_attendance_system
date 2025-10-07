import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ModuleViewScreen extends StatefulWidget {
  final String moduleId;
  final String title;
  final String? url; // Now nullable

  const ModuleViewScreen({
    super.key,
    required this.moduleId,
    required this.title,
    this.url, // Changed to optional
  });

  @override
  State<ModuleViewScreen> createState() => _ModuleViewScreenState();
}

class _ModuleViewScreenState extends State<ModuleViewScreen> {
  WebViewController? _controller;

  @override
  void initState() {
    super.initState();
    // Only initialize the controller if the URL is valid.
    if (widget.url != null) {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..loadRequest(Uri.parse(widget.url!));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      // THE FIX IS HERE: Conditionally show the WebView or an error message.
      body: _controller != null
          ? WebViewWidget(controller: _controller!)
          : const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Error: Could not load module.\nURL was not provided.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.redAccent),
                ),
              ),
            ),
    );
  }
}
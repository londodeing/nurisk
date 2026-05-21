import 'dart:io';
import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

/// PDF Sitrep Generation Service
/// - Creates branded PDF reports
/// - Includes situation, operations, logistics sections
/// - Supports share and print
class SitrepPdfService {
  // Brand colors
  static const PdfColor _primaryColor = PdfColor.fromInt(0xFF1565C0); // Blue
  static const PdfColor _secondaryColor = PdfColor.fromInt(0xFF424242); // Dark grey
  static const PdfColor _accentColor = PdfColor.fromInt(0xFFFF6F00); // Orange
  static const PdfColor _backgroundColor = PdfColor.fromInt(0xFFF5F5F5); // Light grey
  static const PdfColor _textColor = PdfColor.fromInt(0xFF212121); // Almost black

  // Company info
  static const String _companyName = 'NURisk';
  static const String _companyTagline = 'Disaster Response Management';

  /// Generate sitrep PDF for incident
  static Future<String> generateSitrepPdf({
    required int incidentId,
    required String incidentTitle,
    required String disasterType,
    required String status,
    required DateTime createdAt,
    String? description,
    List<Map<String, dynamic>>? timeline,
    List<Map<String, dynamic>>? resources,
    List<Map<String, dynamic>>? missions,
    List<Map<String, dynamic>>? supplies,
    List<Map<String, dynamic>>? gaps,
  }) async {
    final pdf = pw.Document();

    // Build PDF pages
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(40),
        header: (context) => _buildHeader(incidentTitle, disasterType, status),
        footer: (context) => _buildFooter(context),
        build: (context) => [
          // Situation section
          _buildSituationSection(
            incidentTitle: incidentTitle,
            disasterType: disasterType,
            status: status,
            createdAt: createdAt,
            description: description,
            timeline: timeline,
          ),
          pw.SizedBox(height: 20),

          // Operations section
          _buildOperationsSection(
            resources: resources,
            missions: missions,
          ),
          pw.SizedBox(height: 20),

          // Logistics section
          _buildLogisticsSection(
            supplies: supplies,
            gaps: gaps,
          ),
        ],
      ),
    );

    // Save PDF
    final file = await _savePdf(pdf, incidentId);
    return file.path;
  }

  /// Build header
  static pw.Widget _buildHeader(
    String incidentTitle,
    String disasterType,
    String status,
  ) {
    return pw.Container(
      padding: const pw.EdgeInsets.only(bottom: 10),
      decoration: const pw.BoxDecoration(
        border: pw.Border(
          bottom: pw.BorderSide(color: _primaryColor, width: 2),
        ),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
                _companyName,
                style: pw.TextStyle(
                  fontSize: 24,
                  fontWeight: pw.FontWeight.bold,
                  color: _primaryColor,
                ),
              ),
              pw.Text(
                _companyTagline,
                style: const pw.TextStyle(
                  fontSize: 10,
                  color: _secondaryColor,
                ),
              ),
            ],
          ),
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: [
              pw.Text(
                'SITUATION REPORT',
                style: pw.TextStyle(
                  fontSize: 14,
                  fontWeight: pw.FontWeight.bold,
                  color: _primaryColor,
                ),
              ),
              pw.SizedBox(height: 4),
              pw.Container(
                padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: pw.BoxDecoration(
                  color: _getStatusColor(status),
                  borderRadius: pw.BorderRadius.circular(4),
                ),
                child: pw.Text(
                  status.toUpperCase(),
                  style: pw.TextStyle(
                    fontSize: 10,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Build footer
  static pw.Widget _buildFooter(pw.Context context) {
    return pw.Container(
      padding: const pw.EdgeInsets.only(top: 10),
      decoration: const pw.BoxDecoration(
        border: pw.Border(
          top: pw.BorderSide(color: _backgroundColor, width: 1),
        ),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            'Generated: ${DateTime.now().toString().split('.').first}',
            style: const pw.TextStyle(fontSize: 8, color: _secondaryColor),
          ),
          pw.Text(
            'Page ${context.pageNumber} of ${context.pagesCount}',
            style: const pw.TextStyle(fontSize: 8, color: _secondaryColor),
          ),
        ],
      ),
    );
  }

  /// Build situation section
  static pw.Widget _buildSituationSection({
    required String incidentTitle,
    required String disasterType,
    required String status,
    required DateTime createdAt,
    String? description,
    List<Map<String, dynamic>>? timeline,
  }) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('SITUATION OVERVIEW'),
        pw.SizedBox(height: 10),
        _buildInfoRow('Incident', incidentTitle),
        _buildInfoRow('Disaster Type', disasterType),
        _buildInfoRow('Status', status),
        _buildInfoRow('Reported', _formatDateTime(createdAt)),
        if (description != null) ...[
          pw.SizedBox(height: 10),
          pw.Text(
            'Description:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _secondaryColor,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            description,
            style: const pw.TextStyle(fontSize: 10, color: _textColor),
          ),
        ],
        if (timeline != null && timeline.isNotEmpty) ...[
          pw.SizedBox(height: 15),
          pw.Text(
            'Timeline:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _secondaryColor,
            ),
          ),
          pw.SizedBox(height: 4),
          ...timeline.map((t) => _buildTimelineItem(t)),
        ],
      ],
    );
  }

  /// Build operations section
  static pw.Widget _buildOperationsSection({
    List<Map<String, dynamic>>? resources,
    List<Map<String, dynamic>>? missions,
  }) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('OPERATIONS'),
        if (resources != null && resources.isNotEmpty) ...[
          pw.SizedBox(height: 10),
          pw.Text(
            'Deployed Resources:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _secondaryColor,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Table(
            border: pw.TableBorder.all(color: _backgroundColor),
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: _primaryColor),
                children: [
                  _buildTableCell('Resource', PdfColors.white, true),
                  _buildTableCell('Type', PdfColors.white, true),
                  _buildTableCell('Status', PdfColors.white, true),
                  _buildTableCell('Location', PdfColors.white, true),
                ],
              ),
              ...resources.map((r) => pw.TableRow(
                    children: [
                      _buildTableCell(r['name'] ?? '-'),
                      _buildTableCell(r['type'] ?? '-'),
                      _buildTableCell(r['status'] ?? '-'),
                      _buildTableCell(r['location'] ?? '-'),
                    ],
                  )),
            ],
          ),
        ],
        if (missions != null && missions.isNotEmpty) ...[
          pw.SizedBox(height: 15),
          pw.Text(
            'Active Missions:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _secondaryColor,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Table(
            border: pw.TableBorder.all(color: _backgroundColor),
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: _primaryColor),
                children: [
                  _buildTableCell('Mission', PdfColors.white, true),
                  _buildTableCell('Priority', PdfColors.white, true),
                  _buildTableCell('Status', PdfColors.white, true),
                  _buildTableCell('Assigned To', PdfColors.white, true),
                ],
              ),
              ...missions.map((m) => pw.TableRow(
                    children: [
                      _buildTableCell(m['title'] ?? '-'),
                      _buildTableCell(m['priority'] ?? '-'),
                      _buildTableCell(m['status'] ?? '-'),
                      _buildTableCell(m['assignedTo'] ?? '-'),
                    ],
                  )),
            ],
          ),
        ],
        if ((resources == null || resources.isEmpty) &&
            (missions == null || missions.isEmpty))
          pw.Text(
            'No operations data available.',
            style: const pw.TextStyle(fontSize: 10, color: _secondaryColor),
          ),
      ],
    );
  }

  /// Build logistics section
  static pw.Widget _buildLogisticsSection({
    List<Map<String, dynamic>>? supplies,
    List<Map<String, dynamic>>? gaps,
  }) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('LOGISTICS'),
        if (supplies != null && supplies.isNotEmpty) ...[
          pw.SizedBox(height: 10),
          pw.Text(
            'Supply Status:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _secondaryColor,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Table(
            border: pw.TableBorder.all(color: _backgroundColor),
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: _primaryColor),
                children: [
                  _buildTableCell('Item', PdfColors.white, true),
                  _buildTableCell('Quantity', PdfColors.white, true),
                  _buildTableCell('Status', PdfColors.white, true),
                  _buildTableCell('Location', PdfColors.white, true),
                ],
              ),
              ...supplies.map((s) => pw.TableRow(
                    children: [
                      _buildTableCell(s['name'] ?? '-'),
                      _buildTableCell(s['quantity']?.toString() ?? '-'),
                      _buildTableCell(s['status'] ?? '-'),
                      _buildTableCell(s['location'] ?? '-'),
                    ],
                  )),
            ],
          ),
        ],
        if (gaps != null && gaps.isNotEmpty) ...[
          pw.SizedBox(height: 15),
          pw.Text(
            'Identified Gaps:',
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              color: _accentColor,
            ),
          ),
          pw.SizedBox(height: 4),
          ...gaps.map((g) => pw.Container(
                padding: const pw.EdgeInsets.symmetric(vertical: 4),
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Container(
                      width: 6,
                      height: 6,
                      margin: const pw.EdgeInsets.only(top: 3, right: 6),
                      decoration: const pw.BoxDecoration(
                        color: _accentColor,
                        shape: pw.BoxShape.circle,
                      ),
                    ),
                    pw.Expanded(
                      child: pw.Text(
                        g['description'] ?? '-',
                        style: const pw.TextStyle(fontSize: 10),
                      ),
                    ),
                  ],
                ),
              )),
        ],
        if ((supplies == null || supplies.isEmpty) &&
            (gaps == null || gaps.isEmpty))
          pw.Text(
            'No logistics data available.',
            style: const pw.TextStyle(fontSize: 10, color: _secondaryColor),
          ),
      ],
    );
  }

  /// Build section header
  static pw.Widget _buildSectionHeader(String title) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: const pw.BoxDecoration(
        color: _primaryColor,
      ),
      child: pw.Text(
        title,
        style: pw.TextStyle(
          fontSize: 12,
          fontWeight: pw.FontWeight.bold,
          color: PdfColors.white,
        ),
      ),
    );
  }

  /// Build info row
  static pw.Widget _buildInfoRow(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 100,
            child: pw.Text(
              '$label:',
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: _secondaryColor,
              ),
            ),
          ),
          pw.Expanded(
            child: pw.Text(
              value,
              style: const pw.TextStyle(fontSize: 10, color: _textColor),
            ),
          ),
        ],
      ),
    );
  }

  /// Build timeline item
  static pw.Widget _buildTimelineItem(Map<String, dynamic> item) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Container(
            width: 8,
            height: 8,
            margin: const pw.EdgeInsets.only(top: 3, right: 8),
            decoration: const pw.BoxDecoration(
              color: _primaryColor,
              shape: pw.BoxShape.circle,
            ),
          ),
          pw.Expanded(
            child: pw.Text(
              '${item['time'] ?? ''} - ${item['description'] ?? ''}',
              style: const pw.TextStyle(fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  /// Build table cell
  static pw.Widget _buildTableCell(
    String text, [
    PdfColor? bgColor,
    bool isHeader = false,
  ]) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(6),
      color: bgColor,
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontSize: 9,
          fontWeight: isHeader ? pw.FontWeight.bold : pw.FontWeight.normal,
        ),
      ),
    );
  }

  /// Get status color
  static PdfColor _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return PdfColor.fromInt(0xFFD32F2F);
      case 'HIGH':
        return PdfColor.fromInt(0xFFF57C00);
      case 'MEDIUM':
        return PdfColor.fromInt(0xFFFBC02D);
      case 'LOW':
        return PdfColor.fromInt(0xFF388E3C);
      default:
        return PdfColor.fromInt(0xFF757575);
    }
  }

  /// Format date time
  static String _formatDateTime(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  /// Save PDF to file
  static Future<File> _savePdf(pw.Document pdf, int incidentId) async {
    final bytes = await pdf.save();
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/sitrep_$incidentId.pdf');
    await file.writeAsBytes(bytes);
    return file;
  }

  /// Share PDF
  static Future<void> sharePdf(String filePath, {String? subject}) async {
    await Share.shareXFiles(
      [XFile(filePath)],
      subject: subject ?? 'NURisk Sitrep Report',
    );
  }

  /// Print PDF
  static Future<void> printPdf(String filePath) async {
    final file = File(filePath);
    final bytes = await file.readAsBytes();
    await Printing.layoutPdf(onLayout: (format) async => bytes);
  }

  /// Print directly from data
  static Future<void> printFromData(Uint8List bytes) async {
    await Printing.layoutPdf(onLayout: (format) async => bytes);
  }
}
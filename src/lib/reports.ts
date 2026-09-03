import type { Appointment, PaymentMethod } from '../data'

export function formatRwf(amount: number) {
  return `${amount.toLocaleString()} RWF`
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function appointmentsToCsv(rows: Appointment[]) {
  const header = [
    'Receipt',
    'Patient',
    'Doctor',
    'Specialty',
    'Date',
    'Time',
    'Type',
    'Status',
    'Amount (RWF)',
    'Payment status',
    'Payment method',
    'Paid at',
    'Notes',
  ]
  const lines = rows.map((a) =>
    [
      a.receiptId ?? '',
      a.patientName,
      a.doctorName,
      a.specialty,
      a.date,
      a.time,
      a.type,
      a.status,
      String(a.amount),
      a.paymentStatus,
      a.paymentMethod ?? '',
      a.paidAt ?? '',
      (a.notes ?? '').replace(/"/g, '""'),
    ]
      .map((cell) => `"${cell}"`)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export function downloadAppointmentsCsv(rows: Appointment[], filename: string) {
  downloadTextFile(filename, appointmentsToCsv(rows), 'text/csv;charset=utf-8')
}

export function methodLabel(method?: PaymentMethod) {
  switch (method) {
    case 'momo':
      return 'MTN MoMo'
    case 'airtel':
      return 'Airtel Money'
    case 'card':
      return 'Card'
    case 'cash':
      return 'Cash at facility'
    default:
      return '—'
  }
}

/** Opens a printable receipt/report window (Save as PDF from the browser). */
export function downloadPrintableReport(options: {
  title: string
  subtitle?: string
  htmlBody: string
  filenameHint?: string
}) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) {
    alert('Please allow pop-ups to download/print the report.')
    return
  }

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${options.title}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .sub { color: #6b7280; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1fae5; padding: 8px 10px; text-align: left; font-size: 13px; }
    th { background: #ecfdf5; }
    .meta { margin: 4px 0; }
    .brand { color: #059669; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px; }
    .footer { margin-top: 28px; font-size: 12px; color: #6b7280; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="brand">Ubuzima Bwiza</p>
  <h1>${options.title}</h1>
  ${options.subtitle ? `<p class="sub">${options.subtitle}</p>` : ''}
  ${options.htmlBody}
  <p class="footer">Generated ${new Date().toLocaleString()} · Keep this document for your records.</p>
  <p class="no-print"><button onclick="window.print()">Print / Save as PDF</button></p>
  <script>setTimeout(() => window.print(), 350)</script>
</body>
</html>`)
  win.document.close()
}

export function appointmentReceiptHtml(a: Appointment) {
  return `
    <p class="meta"><strong>Receipt:</strong> ${a.receiptId ?? 'Pending'}</p>
    <p class="meta"><strong>Patient:</strong> ${a.patientName}</p>
    <p class="meta"><strong>Doctor:</strong> ${a.doctorName} (${a.specialty})</p>
    <p class="meta"><strong>Visit:</strong> ${a.date} at ${a.time} · ${a.type}</p>
    <p class="meta"><strong>Amount:</strong> ${formatRwf(a.amount)}</p>
    <p class="meta"><strong>Payment:</strong> ${a.paymentStatus}${a.paymentMethod ? ` · ${methodLabel(a.paymentMethod)}` : ''}</p>
    ${a.paidAt ? `<p class="meta"><strong>Paid at:</strong> ${new Date(a.paidAt).toLocaleString()}</p>` : ''}
    ${a.notes ? `<p class="meta"><strong>Notes:</strong> ${a.notes}</p>` : ''}
  `
}

export function appointmentsTableHtml(rows: Appointment[]) {
  const body = rows
    .map(
      (a) => `<tr>
      <td>${a.date} ${a.time}</td>
      <td>${a.patientName}</td>
      <td>${a.doctorName}</td>
      <td>${a.specialty}</td>
      <td>${a.status}</td>
      <td>${formatRwf(a.amount)}</td>
      <td>${a.paymentStatus}</td>
    </tr>`,
    )
    .join('')
  return `<table>
    <thead>
      <tr>
        <th>When</th><th>Patient</th><th>Doctor</th><th>Specialty</th>
        <th>Status</th><th>Amount</th><th>Payment</th>
      </tr>
    </thead>
    <tbody>${body || '<tr><td colspan="7">No records</td></tr>'}</tbody>
  </table>`
}

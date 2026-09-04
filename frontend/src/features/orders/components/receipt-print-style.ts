export const RECEIPT_PAGE_STYLE = `
	@page {
		margin: 0;
	}

	@media print {
		html,
		body {
			margin: 0 !important;
			padding: 0 !important;
			background: #ffffff !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}
`;

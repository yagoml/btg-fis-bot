var body = document.body;
var table = body.querySelector('.moneyValues');
var detailRow = table.querySelector('.detailRow');
var details = detailRow.querySelector('.clearfix .moneyValues');
var fundsRows = details.querySelectorAll('tbody tr[ng-repeat-start]');
var fundsPosInfos = details.querySelectorAll('tbody tr[ng-repeat-end]');
var csv = ['PRODUTO;TIPO;MÊS;ANO;12 MESES;SALDO BRUTO;INÍCIO;APORTE;SALDO LÍQ.;I.R.;IOF;L.BRUTO;% BRUTO;L.LÍQUIDO;% LÍQUIDO'];
var balances = [];
var balanceTotal = 0;
var investedTotal = 0;
var liquidTotal = 0;
var taxTotal = 0;
var iofTotal = 0;
var profitTotal = 0;
var liquidProfitTotal = 0;

function openFIs() {
	table.querySelector('.showDetailIcon')
		.click();
}

function getFloat(num) {
	return parseFloat(num.replace('.', '').replace(',', '.')).toFixed(2) * 1;
}

function downloadCSV(csv) {
	console.log('Downloading -> btg-report.csv ...');
	var csvFile;
	var downloadLink;
	csvFile = new Blob([csv], { type: 'text/csv' });
	downloadLink = document.createElement('a');
	downloadLink.download = 'btg-report.csv';
	downloadLink.href = window.URL.createObjectURL(csvFile);
	downloadLink.style.display = 'none';
	document.body.appendChild(downloadLink);
	downloadLink.click();
	console.log('Check your Downloads folder!');
}

function fillPrimaryValues(fr, i) {
	var productCol = fr.querySelector('[data-th="Produto"]');
	var productAndTypeValue = productCol.querySelector('div span').innerText
		.replace('\n', ';');

	var monthCol = fr.querySelector('[data-th="Mês Atual"]');
	var monthValue = monthCol.querySelector('span').innerText;

	var yearCol = fr.querySelector('[data-th="Ano"]');
	var yearValue = yearCol.querySelector('span').innerText;

	var twelveMonthsCol = fr.querySelector('[data-th="12 meses"]');
	var twelveMonthsValue = twelveMonthsCol.querySelector('span').innerText;

	var balanceCol = fr.querySelector('[data-th="Saldo Bruto (R$)"]');
	balances[i] = getFloat(balanceCol.innerText);

	balanceTotal += balances[i];

	csv.push(
		`${productAndTypeValue};${monthValue};${yearValue};${twelveMonthsValue};${balances[i].toLocaleString()};`
	);
}

function convertPercent(num) {
	return num.toFixed(2).replace('.', ',') + '%'
}

function fillSecondaryValues(fr, i) {
	var detailIcon = fr.querySelector('.showDetailIcon');
	detailIcon.click();
	var tablePosition = fr.nextElementSibling.querySelector('.acquisitionsList table');
	var tableFoot = tablePosition.querySelector('tfoot');
	var positionRow = tablePosition.querySelector('.first').children;
	if (tableFoot) {
		var tableFootRow = tableFoot.children[0]; // tr
		var tableFootCols = tableFootRow.children;
		var invested = getFloat(tableFootCols[3].innerText); // aporte
		var liquidBalance = getFloat(tableFootCols[4].innerText); // saldo líquido
		var tax = getFloat(tableFootCols[5].innerText); // imposto de renda
		var iofText = tableFootCols[6].innerText;
		var iof = iofText === '-' ? 0 : getFloat(iofText); // IOF
	} else {
		var invested = getFloat(positionRow[3].innerText); // aporte
		var liquidBalance = getFloat(positionRow[4].innerText); // saldo líquido
		var tax = getFloat(positionRow[5].innerText); // imposto de renda
		var iofText = positionRow[6].innerText;
		var iof = iofText === '-' ? 0 : getFloat(iofText); // IOF
	}
	var initDate = positionRow[0].innerText; // data de entrada
	var profit = (balances[i] - invested).toFixed(2) * 1; // profit
	var profitPercent = convertPercent((profit / invested) * 100); // profit percent
	var liquidProfit = (liquidBalance - invested).toFixed(2) * 1; // liquid profit
	var liquidProfitPercent = convertPercent((liquidProfit / invested) * 100); // liquid profit percent

	investedTotal += invested;
	liquidTotal += liquidBalance;
	taxTotal += tax;
	iofTotal += iof;
	profitTotal += profit;
	liquidProfitTotal += liquidProfit;

	csv[i + 1] += `${initDate};${invested.toLocaleString()};${liquidBalance.toLocaleString()};${tax.toLocaleString()};${iof.toLocaleString()};${profit.toLocaleString()};${profitPercent};${liquidProfit.toLocaleString()};${liquidProfitPercent}`;
	console.log(csv[i + 1].replace(/\;/g, ' | '));
}

function convertTotal(num) {
	return (num.toFixed(2) * 1).toLocaleString();
}

function insertTotals() {
	csv.push(';;;;;;;;;;;;;;');
	csv.push(`;;;;;${convertTotal(balanceTotal)};;${convertTotal(investedTotal)};${convertTotal(liquidTotal)};${convertTotal(taxTotal)};${convertTotal(iofTotal)};${convertTotal(profitTotal)};;${convertTotal(liquidProfitTotal)}`);
	var balancePercTotal = convertPercent((balanceTotal / investedTotal) * 100);
	var liquidPercTotal = convertPercent((liquidTotal / investedTotal) * 100);
	var taxPercTotal = convertPercent((taxTotal / investedTotal) * 100);
	var iofPercTotal = convertPercent((iofTotal / investedTotal) * 100);
	var profitPercTotal = convertPercent((profitTotal / investedTotal) * 100);
	var liquidProfitPercTotal = convertPercent((liquidProfitTotal / investedTotal) * 100);
	csv.push(`;;;;;${balancePercTotal};;;${liquidPercTotal};${taxPercTotal};${iofPercTotal};${profitPercTotal};;${liquidProfitPercTotal}`);
	console.log('Totals: ', csv[csv.length - 2]);
	console.log('Percent Totals: ', csv[csv.length - 1]);
}

function extractData() {
	if (detailRow.classList.contains('ng-hide')) {
		openFIIs();
	}
	fundsRows.forEach(async (fr, i) => {
		fillPrimaryValues(fr, i);
		setTimeout(() => {
			fillSecondaryValues(fr, i);
			if (i + 1 === fundsRows.length) {
				insertTotals();
				downloadCSV(csv.join('\n'));
			}
		}, 3000 * i);
	});
};

extractData();
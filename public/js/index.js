console.log('frontend part ');
const select_section = document.getElementById('All');
const power = document.getElementById('CCR');
const relay = document.getElementById('PP');
const metering = document.getElementById('RP');;
// const scada = document.getElementById('SCADA');
// const control = document.getElementById('control');



const section = [];
fetch('http://localhost:8080/api/meters')
    .then(response => response.json())
    .then(data => {
        console.log("✅ SQL Data Array from Backend:", data); // <- This logs the full array
        // You can inspect this in the browser console (F12 > Console tab)

        // Example: show first 5 records
        data.slice(0, 5).forEach((row, index) => {
            console.log(`🔹 Row ${index + 1}:`, row);
        });

        // Now parse and show it on the page
        // const tableshow = document.getElementById('tableshow');
        // tableshow.innerHTML = ''; // Clear existing
        // if (data.length === 0) {

        //     tableshow.innerHTML = '<p>No data avaialbe</p>';
        //     return;
        // }
        // // create the table 
        // const table = document.createElement('table');
        // table.classList.add('data-table');

        // Table headers
        // const thead = document.createElement('thead');
        // const headerRow = document.createElement('tr');
        console.log(data[0], 'zeroth element in the array ');
        console.log(data[0].timestamp, 'timestamp ');
        const dateObj = new Date(data[0].timestamp);
        const datePart = dateObj.toISOString().split('T')[0];
        console.log(datePart, "just date part");
        const timePart = dateObj.toTimeString().split(' ')[0];
        console.log(timePart, "just time part ");

        // get all keys from the first object (columnns )
        // const columns = Object.keys(data[0]);
        // columns.forEach(col => {
        //     const th = document.createElement('th');
        //     th.innerText = col;
        //     headerRow.appendChild(th);

        // });
        // thead.appendChild(headerRow);
        // table.appendChild(thead);

        // // Code for table body 
        // const tbody = document.createElement('tbody');
        // data.forEach(row => {
        //     const tr = document.createElement('tr');
        //     columns.forEach(col => {
        //         const td = document.createElement('td');
        //         td.innerText = row[col];
        //         tr.appendChild(td);
        //     });
        //     tbody.appendChild(tr);
        // });
        // table.appendChild(tbody);
        // tableshow.appendChild(table);
        // data.forEach(row => {
        //     tableshow.innerHTML += `<div>${row.timestamp} | S1N1: ${row.S1N1_KWH} | S1N2: ${row.S1N2_KWH}</div>`;
        // });
    })
    .catch(error => {
        document.getElementById('meterData').innerText = 'Error loading data';
        console.error("❌ Fetch error:", error);
    });
/*  binds the fetch button */
document.getElementById('fetchBtn').addEventListener('click', async () => {
  // 1. collect user input
  const section    = document.getElementById('section').value;   // "CCR"
  const startDate  = document.getElementById('startdate').value; // 2025-03-23
  const endDate    = document.getElementById('todate').value;    // 2025-03-24

  if (!section || !startDate || !endDate) {
    alert('Please select section and date range');
    return;
  }

  // 2. POST to backend
  const res  = await fetch('/api/hourlyreport', {
    method : 'POST',
    headers: { 'Content-Type':'application/json' },
    body   : JSON.stringify({ section, startDate, endDate })
  });
  const rows = await res.json();                // <-- [{ date, element, kwh }, …]

  // 3. populate table
  const tbody = document.getElementById('meterTableBody');
  tbody.innerHTML = rows.length
    ? rows.map(r => `
        <tr>
          <td>${r.date}</td>
          <td>${r.element}</td>
          <td>${r.kwh}</td>
        </tr>`).join('')
    : `<tr><td colspan="3">No data</td></tr>`;
});
    
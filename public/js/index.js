console.log('frontend part ');
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
        const tableshow = document.getElementById('tableshow');
        tableshow.innerHTML = ''; // Clear existing
        if(data.length===0){

            tableshow.innerHTML='<p>No data avaialbe</p>';
            return;
        }
        // create the table 
        const table =document.createElement('table');
        table.classList.add('data-table');

        // Table headers
        const thead=document.createElement('thead');
        const headerRow=document.createElement('tr');

        // get all keys from the first object (columnns )
        const columns=Object.keys(data[0]);
        columns.forEach(col=>{
            const th=document.createElement('th');
            th.innerText=col;
            headerRow.appendChild(th);

        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Code for table body 
        const tbody=document.createElement('tbody');
        data.forEach(row=>{
            const tr=document.createElement('tr');
            columns.forEach(col=>{
                const td=document.createElement('td');
                td.innerText=row[col];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableshow.appendChild(table);
        // data.forEach(row => {
        //     tableshow.innerHTML += `<div>${row.timestamp} | S1N1: ${row.S1N1_KWH} | S1N2: ${row.S1N2_KWH}</div>`;
        // });
    })
    .catch(error => {
        document.getElementById('meterData').innerText = 'Error loading data';
        console.error("❌ Fetch error:", error);
    });

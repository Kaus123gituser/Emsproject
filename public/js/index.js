console.log('frontend part ');
const select_section = document.getElementById('All');
const power = document.getElementById('CCR');
const relay = document.getElementById('PP');
const metering = document.getElementById('RP');;
// const scada = document.getElementById('SCADA');
// const control = document.getElementById('control');
// .id's of show functionality 
const ten = document.getElementById('ten');
const fifty = document.getElementById('fifty');
const hundred = document.getElementById('hundred');
// 
/* Code for the Multiple  section selection  */
function displaySelectedSections() {
    const select = document.getElementById('section');
    const selected = Array.from(select.selectedOptions).map(option => option.value);
    const contentDiv = document.querySelector(".content1");
    if (selected.length === 0) {
        contentDiv.innerHTML = "<p>No section selected </p>";
        return;
    }
    contentDiv.innerHTML = selected.map(sec => `<p>${sec}</p>`).join();
}

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
        const timestampstr=data[0].timestamp;
        const[datepart,timepart]=timestampstr.split(" ");
        const [day,month,year]=datepart.split('/');

        // construct a valid ISO string 
        const isoString=`${year}-${month}-${day}T${timepart}`// "2024-12-31T23:45:00"
        const dateObj=new Date(isoString);
        
        console.log(data[0], 'zeroth element in the array ');
        console.log(data[0].timestamp, 'timestamp ');
        // const dateObj = new Date(data[0].timestamp);
        console.log(dateObj.toISOString);
        const datePart = dateObj.toISOString().split('T')[0];
        console.log(datePart, "just date part");
        const timePart = dateObj.toTimeString().split(' ')[0];
        console.log(timePart, "just time part ");

  
    })
    .catch(error => {
        document.getElementById('meterData').innerText = 'Error loading data';
        console.error("❌ Fetch error:", error);
    });
/*  binds the fetch button */
// document.getElementById('fetchBtn').addEventListener('click', async () => {
//     // 1. collect user input
//     const section = document.getElementById('section').value;   // "CCR"
//     const select = document.getElementById('section');
//     const startDate = document.getElementById('startdate').value; // 2025-03-23
//     const endDate = document.getElementById('todate').value;    // 2025-03-24
//     const selectedSection = Array.from(select.selectedOptions).map(option => option.value);
//     if (!selectedSection.length || !startDate || !endDate) {
//         alert('Please select at least one section and date range.');
//         return;
//     }
//     const Allresult = []; // to show all result array 
//     for (const section of selectedSection) {
//         const res = await fetch('/api/hourlyreport', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ section, startDate, endDate })
//         });

//         const rows = await res.json();
//         Allresult.push({ section, rows });
//     }
//     const tbodycontainer = document.getElementById('meterTableBody');
//     tbodycontainer.innerHTML = '';// clear previous results 
//     if (Allresult.every(result => result.rows.length === 0)) {
//         tbodycontainer.innerHTML = `<tr><td colspan="3">No data </td> </tr>`
//         return;
//     }
// /** */
//     // 2. POST to backend
//     const res = await fetch('/api/hourlyreport', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ section, startDate, endDate })
//     });
//     const rows = await res.json();                // <-- [{ date, element, kwh }, …]

//     // 3. populate table
//     const tbody = document.getElementById('meterTableBody');
//     tbody.innerHTML = rows.length
//         ? rows.map(r => `
//         <tr>
//           <td>${r.date}</td>
//           <td>${r.element}</td>
//           <td>${r.kwh}</td>
//         </tr>`).join('')
//         : `<tr><td colspan="3">No data</td></tr>`;
// });
document.getElementById('fetchBtn').addEventListener('click', async () => {
  const sectionSelect = document.getElementById('section');
  const selectedSections = Array.from(sectionSelect.selectedOptions).map(opt => opt.value);
  const startDate  = document.getElementById('startdate').value;
  const endDate    = document.getElementById('todate').value;

  if (!selectedSections.length || !startDate || !endDate) {
    alert('Please select at least one section and date range.');
    return;
  }

  const allResults = [];

  for (const section of selectedSections) {
    const res = await fetch('/api/hourlyreport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, startDate, endDate })
    });
    if(!res.ok){
        const errtext=await res.text();// get server error messsage
        console.log(`❌ api error for section ${section}:`,errtext);
        continue;
    }

    const rows = await res.json();
    allResults.push({ section, rows });
  }

  const tbodyContainer = document.getElementById('meterTableBody');
  tbodyContainer.innerHTML = ''; // clear previous results

  if (allResults.every(result => result.rows.length === 0)) {
    tbodyContainer.innerHTML = '<tr><td colspan="3">No data</td></tr>';
    return;
  }

  allResults.forEach(result => {
    if (result.rows.length) {
      const sectionHeader = `<tr><th colspan="3" style="background:#eee">${result.section}</th></tr>`;
      const rowsHtml = result.rows.map(r => `
        <tr>
          <td>${r.date}</td>
          <td>${r.element}</td>
          <td>${r.kwh}</td>
        </tr>
      `).join('');
      tbodyContainer.innerHTML += sectionHeader + rowsHtml;
    }
  });
});
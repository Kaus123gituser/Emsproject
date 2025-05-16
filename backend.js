console.log('backend part  ');
console.log('serving data from Node.js as backend ');
const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');
const hbs = require('hbs'); // middleware file 
// const { table } = require('console'); // not required here 
const app = express();
const fetch = require('node-fetch'); // npm install node-fetch@2

const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const config = {
    user: 'mywebuser',
    password: 'admin',
    server: 'DELL',
    database: 'JSW',
    options: {
        trustServerCertificate: true
    }
}
sql.connect(config)
    .then(() => console.log('✅ Database connected successfully!'))
    .catch(err => console.error('❌ DB Connection failed:', err));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));
// to serve static files 
app.get('/', (req, res) => {
    //   res.sendFile(path.join(__dirname, 'public', 'home.html'));
    res.render('home');
});
app.get('/hourlyreport', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'Hourlyreport'));
    res.render('Hourlyreport');
});
app.get('/15minreport', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'Hourlyreport'));
    res.render('fifteenminreport');
});
app.get('/variationreport', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'Hourlyreport'));
    res.render('variationreport');
});
app.get('/detail', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'Hourlyreport'));
    res.render('detail');
});
app.get('/api/meter-data', async (req, res) => {
    const pool = await sql.connect(config);
    try {
        // const utclData = await sql.query(`SELECT * FROM UTCL_ROORKEE`);
        const metMasData = await sql.query(`SELECT * FROM dbo.MET_MAS`);
        const metMasData2 = await sql.query(`SELECT * FROM dbo.MET_MAS_RUNS`);
        console.log(" data from metamas   ", metMasData);
        res.json({

            metMas: metMasData.recordset,
            metMas2: metMasData2.recordset,

        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/api/meters', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT TOP 50 * FROM dbo.ALLDATA_KWH4 ORDER BY timestamp DESC');
        res.json(result.recordset, "actual data");
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});
const META_API_URL = 'http://localhost:8080/api/meter-data';        // ← replace with real URL of API ①
const KWH_API_URL = 'http://localhost:8080/api/meters';  // ← replace with real URL of API ②
function timestampToDate(ts) {
    const d = new Date(ts);
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date} ${time}`
    // return d.toISOString().split('')[0];
    // return d.toISOString().split('T')[0];                   // yyyy-mm-dd
}
// Main route 
app.post('/api/hourlyreport', async (req, res) => {
    console.log('✅ /api/hourlyreport route was hit');
    console.log('Request body:', req.body);
    try {
        // read user input 
        const { section, startDate, endDate } = req.body;
        // fetch both API's in parallel
        const [metaRaw, kwhraw] = await Promise.all([
            fetch(META_API_URL).then(r => r.json()),
            fetch(KWH_API_URL).then(r => r.json())
        ]);
        // Filter metadata  by section
        // metaRaw.met_des
        const meters = metaRaw.metMas.filter(m => m.SECTION === section);
        console.log(" matched meters in selected sectionn ", meters);
        // 4) build a map MET_ID -> MET_DES so we can rename Later
        const id2name = {};
        meters.forEach(m => { id2name[m.MET_ID] = m.MET_DES });

        // build a map MET_ID -> MET_DES so we can rename later 
        // 5 keep only rows in kwh API whoose date is in range 
        // kwhr is an array of objects with timestamp 
        // convert start and end to Date Objects once 
        // Convert start and end to Date objects once
        const start = new Date(startDate);
        const end = new Date(endDate);
        // end.setDate(end.getDate()+1);

        end.setDate(end.getDate());
        function parseDDMMYYYY(dateStr) {
            const [day, month, yearTime] = dateStr.split('/');
            const [year, time] = yearTime.split(' ');
            return new Date(`${year}-${month}-${day}T${time || '00:00:00'}`);
        }


        const kwhRowsInRange = kwhraw.filter(row => {
            const d = parseDDMMYYYY(row.timestamp);
            return d >= start && d <= end;
        });
        console.log("filterd KWH rows in date range :", kwhRowsInRange.length);
        // 6 For each meter , grab its KWH field from every row 
        // and build {date ,element , kwh }  rows for the front-end table 
        const tableRows = [];
        kwhRowsInRange.forEach(row => {
            const d = new Date(row.timestamp);
            const dateTimeString = `${d.toISOString().split('T')[0]} ${d.toTimeString().split(' ')[0]}`;
            // const dateonly = timestampToDate(row.timestamp);
            Object.keys(id2name).forEach(metId => {
                const colname = `${metId}_kwh`;
                if (row[colname] !== undefined) {
                    tableRows.push({
                        date: dateTimeString,
                        element: id2name[metId],
                        kwh: row[colname],
                    });
                }
            });
        });
        res.json(tableRows);
        console.log('🚀 Final tableRows being sent to frontend:', tableRows);

    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
})
sql.connect(config).then(pool => {
    return pool.request().query('SELECT TOP 50 * FROM dbo.ALLDATA_KWH4 ORDER BY timestamp DESC');
}).then(result => {
    console.log(result.recordset); // show data
}).catch(err => {
    console.error('SQL Connection Error:', err);
});
// an API for the button 

app.listen(PORT, () => {
    console.log(`Server running succefully at http://localhost:${PORT}`);
})
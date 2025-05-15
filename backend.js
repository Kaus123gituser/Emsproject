console.log('backend part  ');
console.log('serving data from Node.js as backend ');
const express = require('express');
const sql = require('mssql');
const path = require('path');
const cors = require('cors');
const hbs=require('hbs');
const app = express();  
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const config = {
    user: 'mywebuser',
    password: 'admin',
    server: 'DELL',
    database: 'UTCL_ROORKEE',
    options: {
        trustServerCertificate: true
    }
}
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
app.get('/api/meters', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT TOP 50 * FROM dbo.ALLDATA_KWH1 ORDER BY timestamp DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});
sql.connect(config).then(pool => {
    return pool.request().query('SELECT TOP 10 * FROM dbo.ALLDATA_KWH1');
}).then(result => {
    console.log(result.recordset); // show data
}).catch(err => {
    console.error('SQL Connection Error:', err);
});
app.listen(PORT, () => {
    console.log(`Server running succefully at http://localhost:${PORT}`);
})
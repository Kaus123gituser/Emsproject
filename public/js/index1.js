const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server configuration
const dbConfig = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server',
  database: 'your_database',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

app.post('/api/fetch-data', async (req, res) => {
  const { reportType, date, time } = req.body;
  try {
    let pool = await sql.connect(dbConfig);
    let query = '';
    let params = {};

    switch (reportType) {
      case '15min':
        query = `
          SELECT timestamp, meter_id, energy_kwh, voltage
          FROM meter_data
          WHERE timestamp >= @startTime AND timestamp < DATEADD(minute, 15, @startTime)
        `;
        params = { startTime: `${date} ${time}` };
        break;
      case 'hourly':
        query = `
          SELECT 
            DATEADD(hour, DATEDIFF(hour, 0, timestamp), 0) as timestamp,
            meter_id,
            AVG(energy_kwh) as energy_kwh,
            AVG(voltage) as voltage
          FROM meter_data
          WHERE CAST(timestamp AS DATE) = @date
          GROUP BY DATEADD(hour, DATEDIFF(hour, 0, timestamp), 0), meter_id
        `;
        params = { date };
        break;
      case 'monthly':
        query = `
          SELECT 
            DATEADD(month, DATEDIFF(month, 0, timestamp), 0) as timestamp,
            meter_id,
            SUM(energy_kwh) as energy_kwh,
            AVG(voltage) as voltage
          FROM meter_data
          WHERE YEAR(timestamp) = YEAR(@date) AND MONTH(timestamp) = MONTH(@date)
          GROUP BY DATEADD(month, DATEDIFF(month, 0, timestamp), 0), meter_id
        `;
        params = { date };
        break;
      case 'detailed':
        query = `
          SELECT timestamp, meter_id, energy_kwh, voltage
          FROM meter_data
          WHERE CAST(timestamp AS DATE) = @date
          ORDER BY timestamp
        `;
        params = { date };
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    let request = pool.request();
    for (let key in params) {
      request.input(key, params[key]);
    }

    let result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
// just a refrence for future 
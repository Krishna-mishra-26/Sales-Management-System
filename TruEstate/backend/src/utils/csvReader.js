import fs from 'fs';
import csv from 'csv-parser';

export const readCSVData = (filePath, maxRows = null) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;

    console.log('Starting to load CSV data...');
    const startTime = Date.now();

    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Optimize data types for faster processing
        // Pre-calculate search fields
        data._searchName = (data['Customer Name'] || '').toLowerCase();

        data._searchTransactionId = (data['Transaction ID'] || '').toLowerCase();
        data._searchCustomerId = (data['Customer ID'] || '').toLowerCase();
        data._searchProductId = (data['Product ID'] || '').toLowerCase();
        
        // Convert numeric fields once
        data.Age = parseInt(data['Age']) || 0;
        data.Quantity = parseInt(data['Quantity']) || 0;
        data.Price = parseFloat(data['Price per Unit']) || 0;
        data.Total = parseFloat(data['Total Amount']) || 0;
        
        // Convert Date to object for faster comparison
        data.DateObj = new Date(data['Date']);

        results.push(data);
        count++;
        
        // Log progress every 50000 records
        if (count % 50000 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
          console.log(`Loaded ${count} transactions... (${elapsed}s, ${memUsage}MB heap)`);
        }

        // Optional: Stop at maxRows for testing
        if (maxRows && count >= maxRows) {
          stream.destroy();
        }
      })
      .on('end', () => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        console.log(`✓ Successfully loaded ${results.length} transactions (${elapsed}s, ${memUsage}MB heap)`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};

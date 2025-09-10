// Function to convert numbers to words for budget column
function formatBudget(value) {
    if (value === 0 || value === null || value === undefined || value === '') {
        return 'Zero';
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) return 'Zero';
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + ' billion';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' million';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + ' thousand';
    } else {
        return num.toString();
    }
}

// Function to format numbers with commas
function formatNumber(value) {
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    return value;
}

// Function to parse CSV line (handling quotes and commas)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.replace(/"/g, '').trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.replace(/"/g, '').trim()); // Add last value
    return values;
}

// Main function to create and populate the table
async function createDPWHTable(containerId, csvFilePath = 'dpwh-projects.csv') {
    try {
        // Show loading message
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p>Loading data...</p>';
        }
        
        // Fetch CSV file
        const response = await fetch(csvFilePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
        }
        
        const csvContent = await response.text();
        
        // Parse CSV data
        const lines = csvContent.trim().split('\n');
        const headers = parseCSVLine(lines[0]);
        
        // Create table element
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.padding = '5px';
            th.style.border = '1px solid #ddd';
            th.style.backgroundColor = '#4a4a4a';
            th.style.color = 'white';
            th.style.fontWeight = 'bold';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            const values = parseCSVLine(line);
            const tr = document.createElement('tr');
            
            values.forEach((value, index) => {
                const td = document.createElement('td');
                td.style.padding = '8px';
                td.style.border = '1px solid #ddd';
                td.style.verticalAlign = 'top';
                
                // Alternating column colors
                if (index % 2 === 0) { // Odd columns (0-indexed, so even numbers are odd columns)
                    td.style.backgroundColor = '#dedede';
                    td.style.color = '#212529';
                } else { // Even columns
                    td.style.backgroundColor = '#ffffff';
                    td.style.color = '#212529';
                }
                
                // Special formatting for specific columns
                if (headers[index] === '2026 proposed budget') {
                    td.textContent = formatBudget(value);
                    td.style.fontWeight = 'bold';
                } else if (headers[index] === 'Project Name') {
                    td.textContent = value;
                    td.style.maxWidth = '300px';
                    td.style.wordWrap = 'break-word';
                } else if (headers[index].includes('cost') || headers[index] === 'Difference') {
                    td.textContent = formatNumber(parseFloat(value) || value);
                    td.style.textAlign = 'right';
                } else {
                    td.textContent = value;
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        
        // Add table to container
        if (container) {
            container.innerHTML = ''; // Clear loading message
            container.appendChild(table);
        } else {
            document.body.appendChild(table);
        }
        
        console.log('DPWH table created successfully!');
        
    } catch (error) {
        console.error('Error creating table:', error);
        
        // Show error message to user
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<p style="color: red;">Error loading data: ${error.message}</p>`;
        }
    }
}

// Usage examples:
// createDPWHTable('tableContainer'); // Uses default file path 'dpwhprojects.csv'
// createDPWHTable('tableContainer', 'path/to/your/file.csv'); // Custom file path

// Auto-load when DOM is ready (optional)
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment the line below and specify your container ID
    createDPWHTable('tableContainer');
});
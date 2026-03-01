document.addEventListener('DOMContentLoaded', () => {
    const shortenBtn = document.getElementById('shortenBtn');
    const viewAnalyticsBtn = document.getElementById('viewAnalyticsBtn');
    const copyBtn = document.getElementById('copyBtn');

    // Charts
    let geoChart = null;
    let deviceChart = null;

    // --- Shorten URL ---
    shortenBtn.addEventListener('click', async () => {
        const longUrl = document.getElementById('longUrl').value;
        const customAlias = document.getElementById('customAlias').value;

        if (!longUrl) return alert('Please enter a URL');

        try {
            shortenBtn.disabled = true;
            shortenBtn.innerText = 'Creating...';

            const payload = { longUrl };
            if (customAlias && customAlias.trim()) {
                payload.customAlias = customAlias.trim();
            }

            const response = await fetch('/api/v1/urls/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('resultContainer').classList.remove('hidden');
                document.getElementById('shortUrlText').innerText = data.shortUrl;
                // Scroll to result
                document.getElementById('resultContainer').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        } finally {
            shortenBtn.disabled = false;
            shortenBtn.innerHTML = 'Shorten Now <i class="fas fa-bolt"></i>';
        }
    });

    // --- Copy to Clipboard ---
    copyBtn.addEventListener('click', () => {
        const text = document.getElementById('shortUrlText').innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check" style="color: #10b981"></i>';
            setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
        });
    });

    const viewResultAnalyticsBtn = document.getElementById('viewResultAnalyticsBtn');

    // --- View Analytics ---
    viewAnalyticsBtn.addEventListener('click', () => {
        const code = document.getElementById('searchCode').value;
        fetchAnalytics(code);
    });

    viewResultAnalyticsBtn.addEventListener('click', () => {
        const shortUrl = document.getElementById('shortUrlText').innerText;
        const code = shortUrl.split('/').pop();
        document.getElementById('searchCode').value = code;
        fetchAnalytics(code);
    });

    async function fetchAnalytics(code) {
        if (!code) return alert('Please enter a short code or URL');

        // Extract code if full URL is provided
        if (code.includes('/')) {
            code = code.split('/').pop();
        }

        try {
            const response = await fetch(`/api/v1/analytics/${code}`);
            const data = await response.json();

            if (response.ok) {
                renderDashboard(data);
                document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Analytics not found');
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching analytics');
        }
    }

    // Charts
    let browserChart = null;
    let platformChart = null;

    function renderDashboard(data) {
        document.getElementById('noDataPlaceholder').classList.add('hidden');
        document.getElementById('analyticsDashboard').classList.remove('hidden');

        document.getElementById('totalClicks').innerText = data.totalClicks;

        const chartColors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e'];

        // Render Geo Chart
        if (geoChart) geoChart.destroy();
        geoChart = new Chart(document.getElementById('geoChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.breakdown.countries),
                datasets: [{
                    data: Object.values(data.breakdown.countries),
                    backgroundColor: chartColors
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
            }
        });

        // Render Device Chart
        if (deviceChart) deviceChart.destroy();
        deviceChart = new Chart(document.getElementById('deviceChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(data.breakdown.devices),
                datasets: [{
                    label: 'Clicks',
                    data: Object.values(data.breakdown.devices),
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // Render Browser Chart
        if (browserChart) browserChart.destroy();
        browserChart = new Chart(document.getElementById('browserChart'), {
            type: 'polarArea',
            data: {
                labels: Object.keys(data.breakdown.browsers),
                datasets: [{
                    data: Object.values(data.breakdown.browsers),
                    backgroundColor: chartColors.map(c => c + '80') // transparent
                }]
            },
            options: {
                scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8' } } },
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
            }
        });

        // Render Platform Chart
        if (platformChart) platformChart.destroy();
        platformChart = new Chart(document.getElementById('platformChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(data.breakdown.platforms),
                datasets: [{
                    data: Object.values(data.breakdown.platforms),
                    backgroundColor: chartColors
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
            }
        });

        // Recent Clicks Table
        const tbody = document.getElementById('clicksTableBody');
        tbody.innerHTML = '';
        data.recentClicks.forEach(click => {
            const row = `
                <tr>
                    <td>${click.ip}</td>
                    <td>${click.country}</td>
                    <td>${click.device} (${click.platform} / ${click.browser})</td>
                    <td>${new Date(click.timestamp).toLocaleString()}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    }
});

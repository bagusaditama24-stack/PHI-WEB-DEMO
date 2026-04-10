    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>PASIFIK HARVEST INDONESIA - Production Dashboard</title>
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">

        <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
        <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>

        <style>
            :root {
                --bg-dash: #0f172a;
                --card-dash: #1e293b;
                --border: #334155;
                --text-highlight: #ffffff; 
                --text-label: #94a3b8;
                --primary: #38bdf8;
                --success: #4ade80;
                --danger: #f87171;
                --warning: #facc15;
                --purple: #c084fc;
                --wa-header: #1e293b; 
                --wa-tab: #0f172a;
            }

            * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
            
            body {
                margin: 0; font-family: 'Inter', sans-serif;
                background: var(--bg-dash); color: var(--text-highlight);
                overflow-x: hidden; padding-bottom: 70px; 
            }

            body.mode-view .access-control { display: none !important; }

            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

            /* --- LOGIN PAGE --- */
            #loginPage {
                height: 100vh; display: flex; justify-content: center; align-items: center;
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999;
                background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); padding: 20px;
            }
            .login-card {
                background: #ffffff; padding: 30px; width: 100%; max-width: 400px;
                border-radius: 8px; text-align: center; color: #0f172a;
            }
            .login-logo { max-width: 120px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; }
            .login-input {
                width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #cbd5e1; 
                border-radius: 4px; background: #f8fafc; color: #334155; font-size: 1rem; outline: none;
            }
            .login-btn {
                width: 100%; padding: 12px; background: #0f172a; color: white; border: none; border-radius: 4px;
                font-weight: 700; cursor: pointer; transition: 0.2s;
            }

            /* --- HEADER --- */
            header {
                background: var(--card-dash); 
                padding: 15px 25px; 
                border-bottom: 1px solid var(--border);
                position: sticky; top: 0; z-index: 100;
                display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }

            .brand-section { display: flex; align-items: center; gap: 15px; cursor: default; }
            .header-logo { height: 42px; width: auto; background: white; padding: 2px; border-radius: 50%; }
            .brand-text h2 { margin: 0; font-size: 1.1rem; color: var(--text-highlight); font-weight: 700; letter-spacing: 1px; }
            .brand-text span { font-size: 0.7rem; color: var(--text-label); display: block; }
            
            .nav-menu { display: flex; gap: 10px; align-items: center; }
            #clock { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 700; color: var(--warning); margin-right: 15px; }
            
            nav button, nav select {
                padding: 10px 16px; border-radius: 6px; border: 1px solid var(--border);
                background: #0f172a; color: var(--text-highlight); font-size: 0.85rem; font-weight: 600;
                cursor: pointer; white-space: nowrap; font-family: 'Inter', sans-serif;
            }
            nav button:hover { background: #334155; }
            .btn-save { background: #15803d !important; border-color: #15803d !important; }
            .btn-reset { background: #b91c1c !important; border-color: #b91c1c !important; }
            .btn-config { color: var(--warning) !important; border-color: var(--warning) !important; }
            .btn-oee { border-color: var(--purple) !important; color: var(--purple) !important; }

            .mobile-header-right, .bottom-nav, .mobile-menu-dropdown { display: none; }

            /* --- LAYOUT UTAMA --- */
            .container { padding: 30px; max-width: 1600px; margin: 0 auto; }
            
            #section-totals, #section-lines, #section-chart, #section-oee-grid, #section-oee-detail { display: none; } 

            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin-bottom: 35px; }
            .card { background: var(--card-dash); padding: 20px; border-radius: 6px; border: 1px solid var(--border); transition: 0.2s; display: flex; flex-direction: column; justify-content: center; }
            .card:hover { border-color: var(--text-label); background: #263346; }
            
            .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
            .card-title { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text-highlight); font-size: 1.1rem; }
            .card-speed { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.9rem; color: var(--warning); }
            
            .badge { font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; font-weight: 800; display: inline-block; margin-top: 5px; letter-spacing: 0.5px; }
            .badge-club { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); }
            .badge-pouch { background: rgba(192, 132, 252, 0.15); color: var(--purple); border: 1px solid rgba(192, 132, 252, 0.3); }

            .mini-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            .mini-table th { text-align: left; color: var(--text-label); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; padding-bottom: 8px; }
            .mini-table td { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; padding-top: 5px; color: #ffffff; }
            
            .grand-card { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 25px; border-radius: 6px; border: 2px solid var(--warning); text-align: center; }
            .grand-label { font-size: 0.8rem; color: var(--warning); letter-spacing: 2px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
            .grand-val { font-family: 'JetBrains Mono', monospace; font-size: 3.8rem; font-weight: 800; color: white; line-height: 1; }
            
            .reset-control { 
                display: flex; align-items: center; justify-content: center; gap: 10px; 
                margin-top: 20px; background: rgba(0,0,0,0.2); padding: 8px; 
                border-radius: 8px; border: 1px solid #334155;
                font-family: 'JetBrains Mono'; color: #94a3b8; font-size: 0.9rem;
            }
            #displayAutoReset { color: var(--warning); font-weight: bold; font-size: 1.1rem; }

            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }

            /* Chart */
            .chart-container { background: var(--card-dash); padding: 25px; border-radius: 6px; border: 1px solid var(--border); margin-top: 20px; }
            .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .canvas-wrapper { position: relative; height: 350px; width: 100%; }
            .chart-scroll-box { width: 100%; height: 100%; }
            
            .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            table { white-space: nowrap; }

            /* OEE STYLES */
            .oee-selector-card {
                cursor: pointer; position: relative; display: flex; align-items: center; justify-content: space-between;
                background: var(--card-dash); padding: 20px; border-radius: 6px; border: 1px solid var(--border); transition: 0.2s;
            }
            .oee-selector-card:hover { border-color: var(--purple); background: #262c3d; }
            .oee-selector-card .arrow { font-size: 1.2rem; color: #94a3b8; }

            .oee-detail-container { max-width: 900px; margin: 0 auto; }
            .oee-detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
            .btn-back { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 10px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; }
            .btn-back:hover { background: #334155; color: white; }

            .oee-form-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 25px; }
            .oee-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .oee-field { display: flex; flex-direction: column; gap: 6px; }
            .oee-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            .oee-input {
                background: #0f172a; border: 1px solid #334155; color: white;
                padding: 12px; border-radius: 6px; font-family: 'JetBrains Mono'; font-size: 1.1rem; 
                text-align: center; font-weight: bold; transition: border 0.2s;
            }
            .oee-input:focus { border-color: var(--purple); outline: none; background: #151b26; }
            .oee-input::placeholder { color: #334155; font-weight: normal; }

            .oee-summary-bar {
                margin-top: 25px; padding-top: 20px; border-top: 1px solid #334155;
                display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;
            }
            .summary-box h4 { margin: 0; color: #94a3b8; font-size: 0.75rem; margin-bottom: 5px; }
            .summary-box .val { font-family: 'JetBrains Mono'; font-size: 1.8rem; font-weight: 800; color: white; }

            /* MODAL */
            .modal-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85); z-index: 2000;
                justify-content: center; align-items: center; backdrop-filter: blur(5px);
            }
            .modal-card {
                background: #1e293b; border: 1px solid #334155; padding: 25px; border-radius: 12px;
                width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                max-height: 85vh; overflow-y: auto; 
            }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
            .modal-title { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; color: white; margin: 0; }
            .close-btn { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
            
            .speed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
            .input-group { display: flex; flex-direction: column; gap: 5px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border: 1px solid #334155;}
            .input-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
            .label-line { color: white; font-weight: 700; font-family: 'JetBrains Mono'; font-size: 0.9rem; }
            .label-type { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
            .type-club { color: var(--primary); background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.1); }
            .type-round { color: var(--purple); background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.1); }
            .input-group input { background: #0f172a; border: 1px solid #475569; color: var(--warning); padding: 10px; border-radius: 6px; font-family: 'JetBrains Mono'; font-size: 1.1rem; text-align: center; font-weight: bold; }
            .input-group input:focus { border-color: var(--warning); outline: none; background: rgba(250, 204, 21, 0.1); }
            
            .modal-footer { margin-top: 25px; display: flex; gap: 10px; }
            .btn-modal-save { background: var(--warning); color: #0f172a; border: none; padding: 12px; width: 100%; border-radius: 6px; font-weight: bold; cursor: pointer; }
            .btn-modal-cancel { background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 12px; width: 100%; border-radius: 6px; font-weight: bold; cursor: pointer; }

            @media (min-width: 769px) { .modal-card { width: 1000px; max-width: 95%; } }

            /* Time Picker */
            .time-picker-container { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
            .time-input-block { text-align: center; }
            .time-input-block input { background: #0f172a; border: 2px solid var(--primary); color: white; padding: 15px; border-radius: 8px; font-family: 'JetBrains Mono'; font-size: 2rem; text-align: center; font-weight: bold; width: 80px; }
            .time-sep { font-size: 2rem; font-weight: bold; padding-top: 15px; color: #64748b; }

            /* --- MOBILE --- */
            @media (max-width: 768px) {
                header {
                    position: fixed; top: 0; left: 0; width: 100%;
                    background: var(--wa-header); border-bottom: 1px solid #334155;
                    padding: 10px 15px; justify-content: space-between; height: 60px; z-index: 1000;
                }
                .nav-menu { display: none; } 
                
                .brand-section { width: auto; justify-content: flex-start; }
                .header-logo { height: 35px; margin-right: 10px; }
                .brand-text h2 { font-size: 1rem; }
                .brand-text span { display: block; font-size: 0.65rem; text-align: left; }

                .mobile-header-right { display: flex; align-items: center; gap: 10px; }
                .mobile-clock { color: var(--warning); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 700; }
                .mobile-kebab-menu { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; color: white; font-size: 1.5rem; cursor: pointer; }
                
                .mobile-menu-dropdown {
                    display: none; position: fixed; top: 55px; right: 10px;
                    background: #1e293b; border: 1px solid #334155;
                    border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    flex-direction: column; width: 180px; z-index: 1001;
                }
                .mobile-menu-dropdown.active { display: flex; }
                .mobile-menu-dropdown button, .mobile-menu-dropdown select {
                    background: transparent; border: none; border-bottom: 1px solid #334155;
                    color: white; padding: 12px 15px; text-align: left; font-size: 0.85rem; 
                    width: 100%; border-radius: 0; text-transform: uppercase; font-weight: 600;
                }
                .mobile-menu-dropdown select { background: #0f172a; margin: 0; text-transform: none; }
                
                .bottom-nav {
                    display: flex; position: fixed; bottom: 0; left: 0; width: 100%;
                    height: 65px; background: var(--wa-tab); border-top: 1px solid #334155;
                    z-index: 1000; justify-content: space-around; align-items: center;
                }
                .nav-item {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: #94a3b8; font-size: 0.7rem; font-weight: 600; gap: 4px; 
                    width: 25%; height: 100%; cursor: pointer; transition: 0.2s;
                }
                .nav-item.active { color: var(--primary); border-top: 3px solid var(--primary); background: rgba(56, 189, 248, 0.05); }
                .nav-icon { width: 22px; height: 22px; fill: currentColor; }

                body { padding-top: 70px; padding-bottom: 80px; }
                .container { padding: 10px; }
                
                #section-totals, #section-lines, #section-chart, #section-oee-grid, #section-oee-detail { display: none; animation: fadeIn 0.3s; }
                #section-lines { display: block; } 

                .summary-grid { grid-template-columns: 1fr; gap: 10px; margin-bottom: 0; }
                .grid { grid-template-columns: 1fr; gap: 10px; }
                
                .card, .grand-card { 
                    padding: 15px; min-height: 120px; margin-bottom: 0;
                    background: var(--card-dash); border: 1px solid var(--border);
                }
                
                .oee-selector-card { padding: 15px; min-height: auto; }

                .summary-grid .mini-table colgroup col:nth-child(1) { width: 50% !important; }
                .summary-grid .mini-table colgroup col:nth-child(2) { width: 25% !important; }
                .summary-grid .mini-table colgroup col:nth-child(3) { width: 25% !important; }
                .summary-grid .mini-table { table-layout: auto; }
                
                .mini-table td { font-size: 1.4rem; padding-top: 2px; }
                .mini-table th { font-size: 0.7rem; }
                
                .grand-val { font-size: 1.4rem; margin: 0; margin-top: 5px; color: white; }
                .grand-label { font-size: 1.1rem; color: var(--text-highlight); font-family: 'JetBrains Mono', monospace; font-weight:700; margin-bottom:0; text-transform: none; letter-spacing: 0; }
                
                .reset-control { width: 100%; justify-content: center; padding: 5px; margin-top: 10px; font-size: 0.8rem; }

                .table-responsive table { width: 100%; table-layout: fixed; white-space: normal; }
                .table-responsive th { font-size: 0.75rem; vertical-align: middle; }
                .table-responsive td { font-size: 0.85rem; padding: 8px 5px; vertical-align: middle; word-wrap: break-word; }
                .table-responsive th:nth-child(1), .table-responsive td:nth-child(1) { width: 30%; }
                .table-responsive th:nth-child(2), .table-responsive td:nth-child(2) { width: 25%; text-align: center; }
                .table-responsive th:nth-child(3), .table-responsive td:nth-child(3) { width: 45%; }

                .chart-filters { display: flex; justify-content: space-between; gap: 5px; }
                .chart-filters button { flex: 1; margin: 0; padding: 6px 0; font-size: 0.7rem; text-align: center; }
                
            /* --- UPDATE BAGIAN INI DI DALAM @media (max-width: 768px) --- */
                
                .oee-detail-header h3 { font-size: 1rem; }
                .btn-back { padding: 8px 12px; font-size: 0.8rem; }
                .oee-form-card { padding: 15px; } 
                
                /* PERBAIKAN GRID AGAR SEJAJAR */
                .oee-input-grid { 
                    display: grid;
                    grid-template-columns: 1fr 1fr; 
                    gap: 12px 10px; /* Jarak antar kotak */
                }

                .oee-field { 
                    display: flex; 
                    flex-direction: column;
                    justify-content: flex-end; /* Memaksa elemen ke bawah agar rata */
                    height: 100%; /* Mengisi penuh tinggi grid cell */
                }

                .oee-input { 
                    font-size: 0.9rem; 
                    padding: 8px 5px; 
                    height: 40px; 
                    width: 100%; 
                }

                .oee-label { 
                    font-size: 0.65rem; 
                    margin-bottom: 4px;
                    /* KUNCI AGAR SEJAJAR: */
                    min-height: 25px; /* Memberi tinggi minimal (cukup untuk 2 baris teks) */
                    display: flex;
                    align-items: flex-end; /* Teks label rata bawah mendekati input */
                    line-height: 1.1;
                }
                
                /* Bagian bawah tetap sama */
                .oee-summary-bar { gap: 10px; padding-top: 15px; margin-top: 15px; }
                .summary-box .val { font-size: 1.4rem; }
                .modal-card { width: 95%; max-height: 90vh; padding: 15px; }
                .speed-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                .input-group { padding: 5px; gap: 2px; }
                .input-top { flex-direction: column; align-items: center; justify-content: center; margin-bottom: 2px; }
                .label-line { font-size: 0.65rem; white-space: nowrap; }
                .label-type { font-size: 0.5rem; padding: 1px 4px; margin-top: 2px; display: inline-block; }
                .input-group input { padding: 2px; font-size: 1rem; height: 35px; width: 100%; }
                
                .canvas-wrapper { overflow-x: auto; padding-bottom: 10px; }
                .chart-scroll-box { width: 150%; min-width: 600px; height: 300px; }
            }
            
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        </style>
    </head>

    <body>

        <div id="loginPage">
            <div class="login-card">
                <img src="phi.png" alt="Pasific Harvest" class="login-logo" onerror="this.style.display='none'">
                <h1 class="login-title">SYSTEM LOGIN</h1>
                <p style="color:#64748b; margin-bottom:20px;">Production Monitoring</p>
                <input id="username" class="login-input" type="text" placeholder="Username" autocomplete="off" autofocus>
                <input id="password" class="login-input" type="password" placeholder="Password">
                <button id="btnLogin" class="login-btn" onclick="doLogin()">ACCESS DASHBOARD</button>
                <p id="error" style="color:#ef4444; margin-top:15px; font-weight:600;"></p>
            </div>
        </div>

        <div id="dashboardPage" style="display:none;">
            
            <header id="mainHeader">
                <div class="brand-section">
                    <img src="phi.png" alt="Logo" class="header-logo" onerror="this.style.display='none'">
                    <div class="brand-text">
                        <h2>PASIFIK HARVEST INDONESIA</h2>
                        <span>INTEGRATED IOT SYSTEM</span>
                    </div>
                </div>

                <div class="nav-menu">
                    <div id="clock">--:--:--</div>
                    <nav>
                        <button onclick="switchView('dashboard')" style="border-color:var(--text-highlight);">Dashboard</button>
                        <button onclick="switchView('history')">History</button>
                        <button onclick="switchView('oee')" class="btn-oee access-control">INPUT OEE</button>
                        <button onclick="openSpeedModal()" class="btn-config access-control">CONFIG SPEED</button>
                        <button onclick="openResetModal()" class="btn-config access-control" style="color:#fff!important; border-color:#fff!important;">JAM RESET</button>
                        
                        <select id="machineSelectDesktop" class="access-control" onchange="syncSelect(this.value)">
                            <option value="" disabled selected>-- SELECT MACHINE --</option>
                            <option value="all">RESET ALL</option>
                            <option value="machine01">MACHINE 01</option>
                            <option value="machine02">MACHINE 02</option>
                            <option value="machine03">MACHINE 03</option>
                            <option value="machine04">MACHINE 04</option>
                            <option value="machine05">MACHINE 05</option>
                            <option value="machine06">MACHINE 06</option>
                            <option value="machine07">MACHINE 07</option>
                        </select>
                        <button class="btn-save access-control" onclick="manualSave()">SAVE DATA</button>
                        <button class="btn-reset access-control" onclick="resetCounter()">RESET</button>
                        <button onclick="logout()" style="border-color:#ef4444; color:#ef4444;">LOGOUT</button>
                    </nav>
                </div>

                <div class="mobile-header-right">
                    <div id="mobileClock" class="mobile-clock">--:--:--</div>
                    <div class="mobile-kebab-menu" onclick="toggleMobileDropdown()">
                        <span>&#8942;</span>
                    </div>
                </div>
            </header>

            <div class="mobile-menu-dropdown" id="mobileDropdown">
                <button onclick="switchView('dashboard'); toggleMobileDropdown();">Dashboard View</button>
                <button onclick="switchView('history'); toggleMobileDropdown();">History Logs</button>
                <button onclick="openSpeedModal(); toggleMobileDropdown();" class="access-control" style="color:var(--warning);">CONFIG SPEED</button>
                <button onclick="openResetModal(); toggleMobileDropdown();" class="access-control">SET JAM RESET</button>
                <select id="machineSelectMobile" class="access-control" onchange="syncSelect(this.value)">
                    <option value="" disabled selected>-- PILIH MESIN --</option>
                    <option value="all">RESET ALL MACHINES</option>
                    <option value="machine01">MACHINE 01</option>
                    <option value="machine02">MACHINE 02</option>
                    <option value="machine03">MACHINE 03</option>
                    <option value="machine04">MACHINE 04</option>
                    <option value="machine05">MACHINE 05</option>
                    <option value="machine06">MACHINE 06</option>
                    <option value="machine07">MACHINE 07</option>
                </select>
                <button class="btn-save access-control" onclick="manualSave(); toggleMobileDropdown();" style="color:#4ade80;">SAVE DATA</button>
                <button class="btn-reset access-control" onclick="resetCounter(); toggleMobileDropdown();" style="color:#f87171;">RESET COUNTER</button>
                <button onclick="logout()" style="color:#ef4444; font-weight:bold;">LOGOUT</button>
            </div>

            <div class="container" id="viewDashboard">
                
            <div id="section-totals">
        <div class="summary-grid">
            <div class="card" style="border-top: 4px solid var(--primary);">
                <div class="card-header">
                    <div>
                        <span class="card-title" style="color:var(--primary)">TOTAL CLUBCAN</span>
                        </div>
                </div>
                <table class="mini-table">
                    <colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
                    <tr><th>Actual</th><th style="text-align:center">THEORETICAL</th><th style="text-align:right">Eff %</th></tr>
                    <tr><td class="data-val" id="clubActual">0</td><td class="data-val" style="text-align:center" id="clubPredict">0</td><td class="data-val" style="text-align:right" id="clubEff">0%</td></tr>
                </table>
            </div>

            <div class="card" style="border-top: 4px solid var(--purple);">
                <div class="card-header">
                    <div>
                        <span class="card-title" style="color:var(--purple)">TOTAL ROUNDCAN</span>
                        </div>
                </div>
                <table class="mini-table">
                    <colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
                    <tr><th>Actual</th><th style="text-align:center">THEORETICAL</th><th style="text-align:right">Eff %</th></tr>
                    <tr><td class="data-val" id="pouchActual">0</td><td class="data-val" style="text-align:center" id="pouchPredict">0</td><td class="data-val" style="text-align:right" id="pouchEff">0%</td></tr>
                </table>
            </div>

            <div class="grand-card">
                <div class="card-header">
                    <div><span class="grand-label">GRAND TOTAL</span><span class="badge" style="background:rgba(250,204,21,0.2); color:#facc15; border:1px solid rgba(250,204,21,0.4);">PRODUCTION</span></div>
                </div>
                <table class="mini-table">
                    <tr><td colspan="3" class="grand-val" id="grandTotal" style="text-align:left;">0</td></tr>
                </table>
                <div class="reset-control">
                    AUTO RESET: <span id="displayAutoReset" style="margin-left:5px">06:00</span>
                </div>
            </div>
        </div>
    </div>

                <div id="section-lines">
                    <div class="grid" id="cardsContainer"></div>
                </div>

                <div id="section-chart">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3 style="margin:0; font-family:'JetBrains Mono'">OEE PERFORMANCE</h3>
                        </div>
                        <div class="canvas-wrapper">
                            <div class="chart-scroll-box">
                                <canvas id="productionChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="section-oee-grid">
                    <div style="margin-bottom:20px;">
                        <h2 style="font-family:'JetBrains Mono'; font-size:1.3rem; margin:0; color:var(--purple);">INPUT OEE (Pilih Line)</h2>
                        <small style="color:#94a3b8">Masukkan data breakdown untuk analisis OEE (Grafik).</small>
                    </div>
                    <div class="grid" id="oeeSelectorContainer">
                        </div>
                </div>

                <div id="section-oee-detail">
                    <div class="oee-detail-container">
                        <div class="oee-detail-header">
                            <button class="btn-back" onclick="closeOEEDetail()">
                                <span>&#8592;</span> KEMBALI
                            </button>
                            <h3 id="oeeDetailTitle" style="margin:0; color:white; font-family:'JetBrains Mono'">LINE XX DETAIL</h3>
                        </div>

                        <div class="oee-form-card">
                            <div class="oee-input-grid">
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--success)">EXTERNAL STOP (Min)</label>
                                    <input class="oee-input" type="text" id="detail_ext" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_defect')">
                                </div>
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--danger)">QUALITY DEFECT (Min/Pcs)</label>
                                    <input class="oee-input" type="text" id="detail_defect" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_plan')">
                                </div>
                                
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--success)">PLAN DOWNTIME (Min)</label>
                                    <input class="oee-input" type="text" id="detail_plan" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_speed')">
                                </div>
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--danger)">SPEED LOSS (Min)</label>
                                    <input class="oee-input" type="text" id="detail_speed" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_trial')">
                                </div>

                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--success)">TRIAL / SETUP (Min)</label>
                                    <input class="oee-input" type="text" id="detail_trial" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_minor')">
                                </div>
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--danger)">MINOR STOP (Min)</label>
                                    <input class="oee-input" type="text" id="detail_minor" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_unused')">
                                </div>

                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--success)">UNUSED (Min)</label>
                                    <input class="oee-input" type="text" id="detail_unused" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, 'detail_break')">
                                </div>
                                <div class="oee-field">
                                    <label class="oee-label" style="color:var(--danger)">BREAKDOWN (Min)</label>
                                    <input class="oee-input" type="text" id="detail_break" placeholder="0" onfocus="autoPlus(this)" onblur="cleanPlus(this)" onkeydown="handleOEEEnter(event, null)">
                                </div>
                                
                                <div class="oee-field" style="grid-column: 1 / -1; margin-top:10px; border-top:1px solid #334155; padding-top:10px;">
                                    <label class="oee-label">TOTAL AVAILABLE TIME (Setara 24 Jam)</label>
                                    <input class="oee-input" type="number" id="detail_work" value="1440" placeholder="1440" disabled style="color:#64748b; border-color:#334155;">
                                </div>
                            </div>

                            <div class="oee-summary-bar">
                                <div class="summary-box">
                                    <h4>TARGET NETT (Pcs)</h4>
                                    <span class="val" id="detail_run_val" style="color:var(--success)">0</span>
                                </div>
                                <div class="summary-box">
                                    <h4>OEE SCORE (%)</h4>
                                    <span class="val" id="detail_oee_score" style="color:var(--purple)">0%</span>
                                </div>
                            </div>

                            <button class="access-control" onclick="saveCurrentLineOEE()" style="width:100%; margin-top:20px; padding:15px; background:var(--purple); color:white; border:none; border-radius:8px; font-weight:bold; font-size:1rem; cursor:pointer;">
                                SIMPAN DATA OEE
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <div class="container" id="viewHistory" style="display:none">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="font-family:'JetBrains Mono'; font-size:1.5rem; margin:0;">HISTORY LOGS</h2>
                    <button onclick="downloadRealExcel()" style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer; font-family:'Inter',sans-serif; display:flex; align-items:center; gap:8px;">
                        <svg style="width:16px;height:16px;fill:currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        DOWNLOAD .XLSX
                    </button>
                </div>

                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; color:#cbd5e1;">
                        <thead>
                            <tr style="border-bottom:1px solid #334155;">
                                <th style="padding:15px; text-align:left;">TIMESTAMP</th>
                                <th style="padding:15px; text-align:center;">TOTAL</th>
                                <th style="padding:15px; text-align:left;">SUMMARY DETAILS</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="bottom-nav">
            <div class="nav-item active" onclick="switchMobileTab('lines', this)">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                <span>DASHBOARD</span>
            </div>
            <div class="nav-item" onclick="switchMobileTab('totals', this)">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"/></svg>
                <span>TOTALS</span>
            </div>
            <div class="nav-item access-control" onclick="switchMobileTab('oee', this)">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <span>OEE</span>
            </div>
            <div class="nav-item" onclick="switchMobileTab('chart', this)">
                <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
                <span>GRAFIK</span>
            </div>
        </div>

        <div id="speedModal" class="modal-overlay">
            <div class="modal-card">
                <div class="modal-header">
                    <div>
                        <h3 class="modal-title">KONFIGURASI SPEED</h3>
                        <small style="color:#94a3b8; font-size:0.75rem;">CPM = Can Per Menit</small>
                    </div>
                    <button class="close-btn" onclick="closeSpeedModal()">&times;</button>
                </div>
                <div id="speedInputsContainer" class="speed-grid"></div>
                <div class="modal-footer">
                    <button class="btn-modal-cancel" onclick="closeSpeedModal()">BATAL</button>
                    <button class="btn-modal-save" onclick="saveSpeedConfig()">SIMPAN SETTING</button>
                </div>
            </div>
        </div>

        <div id="resetTimeModal" class="modal-overlay">
            <div class="modal-card">
                <div class="modal-header">
                    <div>
                        <h3 class="modal-title">SET JAM AUTO RESET</h3>
                        <small style="color:#94a3b8; font-size:0.75rem;">Format 24 Jam</small>
                    </div>
                    <button class="close-btn" onclick="closeResetModal()">&times;</button>
                </div>
                <div class="time-picker-container">
                    <div class="time-input-block">
                        <label style="display:block; color:#94a3b8; font-size:0.8rem; margin-bottom:5px;">JAM</label>
                        <input type="number" id="inputResetHour" min="0" max="23" value="06" oninput="validateTime(this, 23)">
                    </div>
                    <div class="time-sep">:</div>
                    <div class="time-input-block">
                        <label style="display:block; color:#94a3b8; font-size:0.8rem; margin-bottom:5px;">MENIT</label>
                        <input type="number" id="inputResetMin" min="0" max="59" value="00" oninput="validateTime(this, 59)">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-modal-cancel" onclick="closeResetModal()">BATAL</button>
                    <button class="btn-modal-save" onclick="saveResetTimeConfig()">SIMPAN JADWAL</button>
                </div>
            </div>
        </div>

    <script type="module">
            import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
            import { getDatabase, ref, set, onValue, push, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

            const mqttConfig = {
                host: "broker.emqx.io",
                port: 8084,
                useSSL: true,
                path: "/mqtt",
                username: "",
                password: "",
                topicBase: "iot/produksi_baru" 
            };

            const firebaseConfig = {
                apiKey: "AIzaSyAs_EjizpX2klf1BuzmxXsH6mc6qizvlwQ",
                authDomain: "counter-iot-phi.firebaseapp.com",
                databaseURL: "https://counter-iot-phi-default-rtdb.asia-southeast1.firebasedatabase.app",
                projectId: "counter-iot-phi",
                appId: "1:93383053218:web:efca28132c3e925a866cfb"
            };
            const app = initializeApp(firebaseConfig);
            const database = getDatabase(app);

            let latestCounter = {};
            let globalStartTime = null; 
            let lineConfigs = Array(16).fill(null).map(() => ({ rate: 70, baseline: 0, checkpoint: null })); 
            
            // OEE Data Init
            let oeeData = Array(16).fill(null).map(() => ({
                workingTime: 1440, 
                extStop: 0, planDowntime: 0, trial: 0, unused: 0,
                defect: 0, speedLoss: 0, minorStop: 0, breakdown: 0
            }));
            let currentOEEIndex = 1;

            let prodChart = null;
            let autoResetConfig = { h: 6, m: 0 };

            window.autoPlus = (el) => {
                if(el.value && !el.value.endsWith('+')) {
                    el.value += '+';
                }
            };
            
            window.cleanPlus = (el) => {
                if(el.value.endsWith('+')) {
                    el.value = el.value.slice(0, -1);
                }
                calculateDetailOEE();
            };

            function saveLocalBackup() {
                try {
                    localStorage.setItem('phi_counter_backup', JSON.stringify(latestCounter));
                    localStorage.setItem('phi_oee_backup', JSON.stringify(oeeData));
                    localStorage.setItem('phi_last_active', Date.now());
                    console.log("Local backup saved");
                } catch(e) { console.error("Backup failed", e); }
            }

            setInterval(saveLocalBackup, 30000); 

            // --- NAVIGATION HELPERS ---
            window.switchMobileTab = (tabName, btnElement) => {
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                if(btnElement) btnElement.classList.add('active');
                
                const hideAll = () => {
                    document.getElementById('section-lines').style.display = 'none';
                    document.getElementById('section-totals').style.display = 'none';
                    document.getElementById('section-chart').style.display = 'none';
                    document.getElementById('section-oee-grid').style.display = 'none';
                    document.getElementById('section-oee-detail').style.display = 'none';
                    document.getElementById('viewHistory').style.display = 'none'; 
                    document.getElementById('viewDashboard').style.display = 'block';
                };
                hideAll();

                if(tabName === 'lines') document.getElementById('section-lines').style.display = 'block';
                if(tabName === 'totals') document.getElementById('section-totals').style.display = 'block';
                if(tabName === 'chart') {
                    document.getElementById('section-chart').style.display = 'block';
                    if(prodChart) prodChart.update(); 
                }
                if(tabName === 'oee') document.getElementById('section-oee-grid').style.display = 'block';
            }

            window.toggleMobileDropdown = () => { document.getElementById('mobileDropdown').classList.toggle('active'); }
            window.syncSelect = (val) => {
                document.getElementById('machineSelectDesktop').value = val;
                document.getElementById('machineSelectMobile').value = val;
            }

            // --- LOGIN LOGIC ---
            document.addEventListener('DOMContentLoaded', () => {
                const userField = document.getElementById("username");
                const passField = document.getElementById("password");
                if(userField) userField.focus();
                if(userField) userField.addEventListener("keydown", function(event) { if(event.key === "Enter") { event.preventDefault(); passField.focus(); } });
                if(passField) passField.addEventListener("keydown", function(event) { if(event.key === "Enter") { event.preventDefault(); doLogin(); } });
            });

            window.doLogin = () => {
                const u = document.getElementById("username").value;
                const p = document.getElementById("password").value;
                
                if(u === "admin" && p === "admin123") {
                    sessionStorage.setItem("login", "1");
                    sessionStorage.setItem("role", "operator"); 
                    location.reload();
                } 
                else if(u === "phi" && p === "phjaya") {
                    sessionStorage.setItem("login", "1");
                    sessionStorage.setItem("role", "viewer"); 
                    location.reload();
                } 
                else {
                    document.getElementById("error").innerText = "Username/Password Salah";
                }
            };
            window.logout = () => { sessionStorage.clear(); location.reload(); };

            window.onload = () => {
                if(document.getElementById("loginPage") && document.getElementById("loginPage").style.display !== "none") {
                    if(document.getElementById("username")) document.getElementById("username").focus();
                }
                if(sessionStorage.getItem("login") === "1") {
                    document.getElementById("loginPage").style.display = "none";
                    document.getElementById("dashboardPage").style.display = "block";
                    
                    const userRole = sessionStorage.getItem("role");
                    if(userRole === "viewer") {
                        document.body.classList.add("mode-view");
                    }

                    const savedReset = localStorage.getItem("phi_autoreset");
                    if(savedReset) { try { autoResetConfig = JSON.parse(savedReset); } catch(e){} }
                    updateResetDisplay();

                    generateCards(); 
                    generateOEESelectors(); 
                    
                    if(window.innerWidth > 768) {
                        document.getElementById('section-lines').style.display = 'block';
                        document.getElementById('section-totals').style.display = 'block';
                        document.getElementById('section-chart').style.display = 'block';
                    } else {
                        document.getElementById('section-lines').style.display = 'block';
                    }
                    
                    syncConfigRates(); 
                    initChart(); 
                    syncGlobalStartTime();

                    loadCache(); 
                    loadOEEData(); 
                    connectMQTT();
                    setInterval(updateClock, 1000);
                    setInterval(updateUI, 1000);
                    
                    ['detail_work','detail_ext','detail_plan','detail_trial','detail_unused','detail_defect','detail_speed','detail_minor','detail_break'].forEach(id => {
                        document.getElementById(id).addEventListener('input', calculateDetailOEE);
                    });
                }
            };

            // --- OEE LOGIC ---
            window.handleOEEEnter = (e, nextId) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (nextId) {
                        document.getElementById(nextId).focus();
                    } else {
                        saveCurrentLineOEE();
                    }
                }
            };

            window.generateOEESelectors = () => {
                const c = document.getElementById("oeeSelectorContainer");
                c.innerHTML = "";
                for(let i=1; i<=15; i++) {
                    if(i === 13) continue;
                    let isRound = (i === 5 || i === 6);
                    let badgeClass = isRound ? "badge-pouch" : "badge-club";
                    let typeName = isRound ? "ROUNDCAN" : "CLUBCAN";
                    c.innerHTML += `
                    <div class="oee-selector-card" onclick="openOEEDetail(${i})">
                        <div>
                            <div style="font-family:'JetBrains Mono'; font-weight:700; font-size:1.1rem; color:white;">LINE ${i.toString().padStart(2,'0')}</div>
                            <span class="badge ${badgeClass}" style="margin-top:5px;">${typeName}</span>
                        </div>
                        <div class="arrow">&#10095;</div>
                    </div>`;
                }
            };

      window.openOEEDetail = (idx) => {
    currentOEEIndex = idx;
    document.getElementById('section-oee-grid').style.display = 'none';
    document.getElementById('section-oee-detail').style.display = 'block';
    document.getElementById('oeeDetailTitle').innerText = `LINE ${idx.toString().padStart(2,'0')} DETAIL`;
    
    const d = oeeData[idx] || {};

    // --- PERUBAHAN DISINI ---
    // Hitung waktu dinamis
    const dynamicTime = getDynamicWorkingTime(idx);
    
    // Masukkan ke input detail_work
    // Jika belum ada data tersimpan (d.workingTime default 1440), gunakan dynamicTime
    // Namun untuk kasus Anda, kita paksa selalu update sesuai theoretical saat ini:
    document.getElementById('detail_work').value = dynamicTime; 
    // ------------------------

    const fill = (id, val) => {
        document.getElementById(id).value = (val && val !== 0 && val !== "0") ? val : "";
    }

    // ... (kode sisa fill lainnya tetap sama: detail_ext, detail_plan, dst)
    fill('detail_ext', d.extStop);
    fill('detail_plan', d.planDowntime);
    fill('detail_trial', d.trial);
    fill('detail_unused', d.unused);
    fill('detail_defect', d.defect);
    fill('detail_speed', d.speedLoss);
    fill('detail_minor', d.minorStop);
    fill('detail_break', d.breakdown);
    
    calculateDetailOEE(); // Hitung ulang skor saat dibuka
};

            window.closeOEEDetail = () => {
                document.getElementById('section-oee-detail').style.display = 'none';
                document.getElementById('section-oee-grid').style.display = 'block';
            };

          function calculateDetailOEE() {
    const evalSum = (id) => {
        const val = document.getElementById(id).value;
        if (!val) return 0;
        return val.toString().split('+').reduce((a, b) => Number(a) + (Number(b) || 0), 0);
    };

    // --- PERUBAHAN DISINI ---
    // Ambil Total Waktu dari inputan (yang sudah otomatis dihitung dari Theo/Speed)
    let totalAvailableTime = parseFloat(document.getElementById('detail_work').value) || 0;
    
    // breakdown input (potongan-potongan)
    const ext = evalSum('detail_ext');
    const plan = evalSum('detail_plan');
    const trial = evalSum('detail_trial');
    const unused = evalSum('detail_unused');
    const defect = evalSum('detail_defect');
    const speed = evalSum('detail_speed');
    const minor = evalSum('detail_minor');
    const brk = evalSum('detail_break');

    const totalPotongan = ext + plan + trial + unused + defect + speed + minor + brk;
    
    // Net Time = Waktu Teoritis (Working Time) - Total Downtime
    let netTime = totalAvailableTime - totalPotongan;
    if(netTime < 0) netTime = 0;

    // Hitung Target Baru berdasarkan Net Time x Speed Mesin
    const actual = latestCounter[`L${currentOEEIndex}`] || 0;
    const rate = lineConfigs[currentOEEIndex-1]?.rate || 1;
    
    const target = Math.floor(netTime * rate);
    
    let oeeScore = 0;
    if (target > 0) {
        oeeScore = ((actual / target) * 100).toFixed(1);
    }
    // Batasi max 100% jika diinginkan, atau biarkan lebih jika actual > target
    if(oeeScore > 100) oeeScore = 100; 

    document.getElementById('detail_run_val').innerText = target.toLocaleString('id-ID'); 
    document.getElementById('detail_oee_score').innerText = oeeScore + "%";
}

   window.saveCurrentLineOEE = async () => {
    const idx = currentOEEIndex;
    const getRawVal = (id) => {
        let val = document.getElementById(id).value.trim();
        if(val.endsWith('+')) val = val.slice(0, -1);
        return val; 
    }
    
    oeeData[idx] = { 
        // --- PERUBAHAN DISINI ---
        // Simpan nilai dari input detail_work
        workingTime: document.getElementById('detail_work').value || 0,
        // ------------------------
        extStop: getRawVal('detail_ext'),
        planDowntime: getRawVal('detail_plan'),
        trial: getRawVal('detail_trial'),
        unused: getRawVal('detail_unused'),
        defect: getRawVal('detail_defect'),
        speedLoss: getRawVal('detail_speed'),
        minorStop: getRawVal('detail_minor'),
        breakdown: getRawVal('detail_break')
    };

    const updates = {};
    updates[idx] = oeeData[idx];
    closeOEEDetail(); 
    await set(ref(database, 'config/oeeData'), updates);
    updateUI(); 
};
            async function loadOEEData() {
                const localOEE = localStorage.getItem('phi_oee_backup');
                if(localOEE) {
                    try {
                        const parsed = JSON.parse(localOEE);
                        if(parsed) oeeData = parsed;
                    } catch(e){}
                }
                const snap = await get(ref(database, 'config/oeeData'));
                if(snap.exists()) {
                    const data = snap.val();
                    data.forEach((d, i) => {
                        if(d && i !== 13) oeeData[i] = d;
                    });
                }
            }

            // --- NAVIGATION & LOGIC ---
            window.switchView = (v) => {
                const hideAll = () => {
                    document.getElementById('viewHistory').style.display = 'none';
                    document.getElementById('viewDashboard').style.display = 'none';
                    document.getElementById('section-lines').style.display = 'none';
                    document.getElementById('section-totals').style.display = 'none';
                    document.getElementById('section-chart').style.display = 'none';
                    document.getElementById('section-oee-grid').style.display = 'none';
                    document.getElementById('section-oee-detail').style.display = 'none';
                };

                if(v === 'history') {
                    hideAll();
                    loadHistoryTable();
                    document.getElementById('viewHistory').style.display = 'block';
                } else if (v === 'oee') {
                    hideAll();
                    document.getElementById('viewDashboard').style.display = 'block';
                    document.getElementById('section-oee-grid').style.display = 'block';
                    if(window.innerWidth <= 768) switchMobileTab('oee', document.querySelectorAll('.nav-item')[2]);
                } else {
                    hideAll();
                    document.getElementById('viewDashboard').style.display = 'block';
                    if(window.innerWidth > 768) {
                        document.getElementById('section-lines').style.display = 'block';
                        document.getElementById('section-totals').style.display = 'block';
                        document.getElementById('section-chart').style.display = 'block';
                    } else {
                        switchMobileTab('lines', document.querySelector('.nav-item'));
                    }
                }
            };

            window.openResetModal = () => {
                document.getElementById("inputResetHour").value = autoResetConfig.h.toString().padStart(2, '0');
                document.getElementById("inputResetMin").value = autoResetConfig.m.toString().padStart(2, '0');
                document.getElementById("resetTimeModal").style.display = "flex";
            }
            window.closeResetModal = () => { document.getElementById("resetTimeModal").style.display = "none"; }
            window.validateTime = (el, max) => {
                let val = parseInt(el.value);
                if (isNaN(val)) return; 
                if (val > max) el.value = max; else if (val < 0) el.value = 0;
            };
            
            window.saveResetTimeConfig = () => {
                let h = parseInt(document.getElementById("inputResetHour").value);
                let m = parseInt(document.getElementById("inputResetMin").value);
                if(isNaN(h)||h<0) h=0; if(h>23) h=23; 
                if(isNaN(m)||m<0) m=0; if(m>59) m=59; 
                autoResetConfig = { h, m };
                localStorage.setItem("phi_autoreset", JSON.stringify(autoResetConfig));
                updateResetDisplay();
                closeResetModal();
                checkMissedReset(); 
            }

            function updateResetDisplay() {
                const display = document.getElementById("displayAutoReset");
                if(display) display.innerText = `${autoResetConfig.h.toString().padStart(2,'0')}:${autoResetConfig.m.toString().padStart(2,'0')}`;
            }

            async function syncConfigRates() {
                const snap = await get(ref(database, 'config/lineConfigs'));
                if (snap.exists()) {
                    const savedData = snap.val();
                    savedData.forEach((obj, index) => {
                        if (obj) lineConfigs[index] = { rate: parseInt(obj.rate)||70, baseline: parseInt(obj.baseline)||0, checkpoint: obj.checkpoint||globalStartTime };
                    });
                }
                generateCards(); updateUI();
            }

            window.openSpeedModal = () => {
                const container = document.getElementById("speedInputsContainer");
                container.innerHTML = "";
                for(let i=1; i<=15; i++) {
                    if(i === 13) continue;
                    let val = lineConfigs[i-1]?.rate || 70;
                    let isRound = (i === 5 || i === 6);
                    let typeLabel = isRound ? "ROUND" : "CLUB"; 
                    let typeClass = isRound ? "type-round" : "type-club";
                    container.innerHTML += `<div class="input-group"><div class="input-top"><span class="label-line">LINE ${i.toString().padStart(2,'0')}</span><span class="label-type ${typeClass}">${typeLabel}</span></div><input type="number" id="inputSpeed_${i}" value="${val}" min="1" onkeydown="if(event.key==='Enter') { saveSpeedConfig(false); window.handleSpeedEnter(event, ${i}); }"></div>`;
                }
                document.getElementById("speedModal").style.display = "flex";
            };
            window.closeSpeedModal = () => { document.getElementById("speedModal").style.display = "none"; };
            window.handleSpeedEnter = (e, currentIdx) => {
                e.preventDefault();
                let nextIdx = currentIdx + 1;
                if (nextIdx === 13) nextIdx = 14; 
                if (nextIdx > 15) nextIdx = 1;      
                const nextEl = document.getElementById(`inputSpeed_${nextIdx}`);
                if (nextEl) { nextEl.focus(); nextEl.select(); }
            };
            window.saveSpeedConfig = async (close = true) => {
                const updates = {};
                for(let i=1; i<=15; i++) {
                    if(i === 13) continue;
                    const input = document.getElementById(`inputSpeed_${i}`);
                    if(input) {
                        const newRate = parseInt(input.value);
                        if(!isNaN(newRate) && newRate > 0) {
                            lineConfigs[i-1] = { ...lineConfigs[i-1], rate: newRate };
                            updates[`${i-1}`] = lineConfigs[i-1];
                        }
                    }
                }
                await set(ref(database, 'config/lineConfigs'), updates);
                generateCards(); updateUI(); 
                if(close) closeSpeedModal(); 
            };

            function checkMissedReset() {
                if (!globalStartTime) return; 
                const now = new Date();
                const scheduledResetToday = new Date();
                scheduledResetToday.setHours(autoResetConfig.h, autoResetConfig.m, 0, 0);

                if (now > scheduledResetToday) {
                    if (new Date(globalStartTime) < scheduledResetToday) {
                        console.log("Auto Reset Terlewat! Melakukan Reset Susulan...");
                        saveAndReset("ALL", scheduledResetToday.getTime());
                    }
                }
            }

            function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', {hour12: false});
            
            if(document.getElementById("clock")) document.getElementById("clock").innerText = timeStr;
            if(document.getElementById("mobileClock")) document.getElementById("mobileClock").innerText = timeStr; 
            
            if (now.getHours() === autoResetConfig.h && 
                now.getMinutes() === autoResetConfig.m && 
                now.getSeconds() === 0) { 
                saveAndReset("ALL", now.getTime()); 
            }
            else {
                checkMissedReset(); 
            }
        }

            function syncGlobalStartTime() {
                const startRef = ref(database, 'config/productionStartTime');
                onValue(startRef, (snap) => {
                    if(snap.val()) { 
                        globalStartTime = snap.val(); 
                        checkMissedReset();
                    } 
                    else { 
                        const now = Date.now(); 
                        set(startRef, now); 
                        globalStartTime = now; 
                    }
                });
            }

        // ----------------------------------------------------------------------
        // 1. BLIND THEORETICAL (Untuk Dashboard: Jalan Terus)
        // ----------------------------------------------------------------------
        function calculateGrossTheoretical(lineIndex) {
            if (!lineConfigs[lineIndex-1]) return 0;
            const config = lineConfigs[lineIndex-1];
            const rate = Number(config.rate) || 0;
            
            let minutesRunning = 0;
            if (config.checkpoint) {
                minutesRunning = (Date.now() - config.checkpoint) / 60000;
            } else if(globalStartTime) {
                minutesRunning = (Date.now() - globalStartTime) / 60000;
            }
            if(minutesRunning < 0) minutesRunning = 0;

            // Rumus: Baseline + (Waktu Berjalan x Speed)
            // Tidak peduli breakdown, tidak peduli OEE.
            return (Number(config.baseline) || 0) + Math.floor(minutesRunning * rate);
        }
        // Fungsi baru untuk menghitung menit berdasarkan Theoretical / Speed
function getDynamicWorkingTime(lineIndex) {
    const theo = calculateGrossTheoretical(lineIndex); // Ambil nilai Theoretical saat ini
    const config = lineConfigs[lineIndex-1]; // Ambil config speed
    const rate = config ? (Number(config.rate) || 70) : 70; // Default 70 jika error

    if (rate === 0) return 0; // Hindari pembagian dengan 0
    
    // Rumus: Theoretical / Speed
    // Hasilnya dibulatkan (Math.round) atau diambil desimalnya (toFixed)
    return Math.round(theo / rate); 
}

        // ----------------------------------------------------------------------
        // 2. OEE THEORETICAL (Untuk Grafik: Dikurangi Downtime)
        // ----------------------------------------------------------------------
        function calculateNetTheoretical(lineIndex) {
            if (!lineConfigs[lineIndex-1]) return 0;
            const config = lineConfigs[lineIndex-1];
            const rate = Number(config.rate) || 0;
            
            let minutesRunning = 0;
            if (config.checkpoint) {
                minutesRunning = (Date.now() - config.checkpoint) / 60000;
            } else if(globalStartTime) {
                minutesRunning = (Date.now() - globalStartTime) / 60000;
            }
            if(minutesRunning < 0) minutesRunning = 0;

            const d = oeeData[lineIndex] || {};
            const parseLoss = (val) => {
                if (!val) return 0;
                return val.toString().split('+').reduce((a, b) => Number(a) + (Number(b) || 0), 0);
            };

            const totalDowntimeMinutes = 
                parseLoss(d.extStop) + parseLoss(d.planDowntime) + parseLoss(d.trial) + parseLoss(d.unused) + 
                parseLoss(d.defect) + parseLoss(d.speedLoss) + parseLoss(d.minorStop) + parseLoss(d.breakdown);

            const gross = (Number(config.baseline) || 0) + Math.floor(minutesRunning * rate);
            const lossPcs = Math.floor(totalDowntimeMinutes * rate);

            let net = gross - lossPcs;
            if (net < 0) net = 0;
            return net;
        }

            function updateSpecificLine(lineIndex) {
                const actual = latestCounter[`L${lineIndex}`] || 0;
                // DASHBOARD KEMBALI KE BLIND THEORETICAL
                const prediction = calculateGrossTheoretical(lineIndex); 
                
                let eff = 0;
                if(prediction > 0) eff = ((actual / prediction) * 100).toFixed(1);
                if(eff > 100) eff = 100;
                
                const elActual = document.getElementById(`L${lineIndex}`);
                if (elActual) {
                    elActual.innerText = Number(actual).toLocaleString('id-ID'); 
                    document.getElementById(`P${lineIndex}`).innerText = Number(prediction).toLocaleString('id-ID');
                    
                    const elEff = document.getElementById(`E${lineIndex}`);
                    elEff.innerText = eff + '%';
                    if(eff >= 90) elEff.style.color = '#4ade80';
                    else if(eff >= 70) elEff.style.color = '#facc15';
                    else elEff.style.color = '#f87171';
                }
                updateTotals();
            }

            function updateTotals() {
                let sumClubAct = 0, sumClubPred = 0;
                let sumPouchAct = 0, sumPouchPred = 0;
                for (let i = 1; i <= 15; i++) {
                    if(i === 13) continue;
                    const actual = latestCounter[`L${i}`] || 0;
                    // DASHBOARD KEMBALI KE BLIND THEORETICAL
                    const prediction = calculateGrossTheoretical(i); 
                    if(i === 5 || i === 6) { sumPouchAct += actual; sumPouchPred += prediction; } else { sumClubAct += actual; sumClubPred += prediction; }
                }
                
                document.getElementById("clubActual").innerText = sumClubAct.toLocaleString('id-ID');
                document.getElementById("clubPredict").innerText = sumClubPred.toLocaleString('id-ID');
                
                let clubEff = sumClubPred > 0 ? ((sumClubAct / sumClubPred) * 100).toFixed(0) : 0;
                if(clubEff > 100) clubEff = 100;
                document.getElementById("clubEff").innerText = clubEff + "%";
                
                document.getElementById("pouchActual").innerText = sumPouchAct.toLocaleString('id-ID');
                document.getElementById("pouchPredict").innerText = sumPouchPred.toLocaleString('id-ID');
                
                let pouchEff = sumPouchPred > 0 ? ((sumPouchAct / sumPouchPred) * 100).toFixed(0) : 0;
                if(pouchEff > 100) pouchEff = 100;
                document.getElementById("pouchEff").innerText = pouchEff + "%";
                
                const grandTotal = sumClubAct + sumPouchAct;
                document.getElementById("grandTotal").innerText = grandTotal.toLocaleString('id-ID');
                
                if(prodChart) updateBarChart();
            }

            function updateUI() { for (let i = 1; i <= 15; i++) { if(i === 13) continue; updateSpecificLine(i); } }

            function connectMQTT() {
                const client = mqtt.connect(`wss://${mqttConfig.host}:${mqttConfig.port}${mqttConfig.path}`, { username: mqttConfig.username, password: mqttConfig.password, clientId: 'web_' + Math.random().toString(16).substr(2, 8) });
                client.on("connect", () => { window.mqttClient = client; for(let i=1; i<=7; i++) client.subscribe(`${mqttConfig.topicBase}/machine0${i}/counter`); });
                client.on("message", (topic, msg) => {
                    try {
                        const data = JSON.parse(msg.toString());
                        const machine = topic.split('/')[2];
                        if(Object.values(data.counter).every(v => v === 0) && data.reset_source !== "web") return;
                        Object.assign(latestCounter, data.counter);
                        Object.keys(data.counter).forEach(key => { const lineNum = parseInt(key.replace("L", "")); if (!isNaN(lineNum)) updateSpecificLine(lineNum); });
                        set(ref(database, `lastCache/${machine}`), data);
                    } catch(e){}
                });
            }

            window.generateCards = () => {
                const c = document.getElementById("cardsContainer");
                if(!c) return; c.innerHTML = "";
                for(let i=1; i<=15; i++) {
                    if(i === 13) continue; 
                    let badgeClass = (i === 5 || i === 6) ? "badge-pouch" : "badge-club";
                    let typeName = (i === 5 || i === 6) ? "ROUNDCAN" : "CLUBCAN";
                    let currentSpeed = lineConfigs[i-1]?.rate || 70;
                    c.innerHTML += `<div class="card"><div class="card-header"><div><span class="card-title">LINE ${i.toString().padStart(2,'0')}</span><span class="badge ${badgeClass}">${typeName}</span></div><span class="card-speed">${currentSpeed} CPM</span></div><table class="mini-table"><colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup><tr><th>Actual</th><th style="text-align:center">THEORETICAL</th><th style="text-align:right">Eff %</th></tr><tr><td class="data-val" id="L${i}">0</td><td class="data-val" style="text-align:center" id="P${i}">0</td><td class="data-val" style="text-align:right" id="E${i}">0%</td></tr></table></div>`;
                }
            }

            async function saveAndReset(targetMachine, forcedTime = null) {
                const grand = document.getElementById("grandTotal").innerText;
                const lineSnapshot = {};
                let totalTheoGlobal = 0;
                let globalOEE = { workingTime: 0, breakdown: 0, downtime: 0, totalLoss: 0 };

                const parseLoss = (val) => {
                    if (!val) return 0;
                    return val.toString().split('+').reduce((a, b) => Number(a) + (Number(b) || 0), 0);
                };

                for(let i=1; i<=15; i++) {
                    if(i === 13) continue;
                    const act = latestCounter[`L${i}`] || 0;
                    const theo = calculateGrossTheoretical(i); // Simpan yang Blind di History
                    totalTheoGlobal += theo;
                    
                    let eff = 0;
                    if(theo > 0) eff = ((act / theo) * 100).toFixed(1);
                    
                    const d = oeeData[i] || {};
                    const lineLoss = parseLoss(d.defect) + parseLoss(d.speedLoss) + parseLoss(d.minorStop) + parseLoss(d.breakdown);
                    
                    globalOEE.workingTime += (d.workingTime || 1440);
                    globalOEE.breakdown += parseLoss(d.breakdown);
                    globalOEE.totalLoss += lineLoss;

                    lineSnapshot[`L${i}`] = {
                        actual: act,
                        theoretical: theo,
                        efficiency: eff,
                        oee: {...d} 
                    };
                }

                const totalActGlobal = parseInt(grand.replace(/\./g, '')) || 0;
                let globalEff = 0;
                if(totalTheoGlobal > 0) globalEff = ((totalActGlobal / totalTheoGlobal) * 100).toFixed(1);

                await push(ref(database, 'history'), { 
                    time: new Date().toLocaleString('id-ID'), 
                    grandTotal: grand, 
                    grandTheoretical: totalTheoGlobal,
                    globalEfficiency: globalEff,
                    globalOEE: globalOEE,
                    lineDetails: lineSnapshot, 
                    resetType: targetMachine + (forcedTime ? " (AUTO CATCH-UP)" : "") 
                });

                const newStartTime = forcedTime ? forcedTime : Date.now();
                const isAll = (targetMachine === "ALL");
                let targetLines = [];
                
                if (isAll) {
                    for(let i=1; i<=15; i++) { if(i !== 13) targetLines.push(i); }
                } else {
                    const machineNum = parseInt(targetMachine.replace("machine", ""));
                    if (machineNum === 7) { targetLines = [14, 15]; } 
                    else { targetLines = [(machineNum * 2) - 1, (machineNum * 2)]; }
                }

                const updates = {};
                const oeeUpdates = {};
                const defaultOEE = { workingTime: 1440, extStop: 0, planDowntime: 0, trial: 0, unused: 0, defect: 0, speedLoss: 0, minorStop: 0, breakdown: 0 };

                if (isAll) {
                    await set(ref(database, 'config/productionStartTime'), newStartTime);
                    globalStartTime = newStartTime; 
                    lineConfigs = lineConfigs.map(cfg => ({ ...cfg, baseline: 0, checkpoint: newStartTime }));
                    lineConfigs.forEach((cfg, idx) => { updates[`${idx}`] = cfg; });
                    oeeData = Array(16).fill(null).map(() => ({...defaultOEE}));
                    oeeData.forEach((d, i) => { if(i!==13) oeeUpdates[i]=d; });
                } else {
                    targetLines.forEach(lineNum => {
                        const idx = lineNum - 1;
                        if (lineConfigs[idx]) {
                            lineConfigs[idx] = { ...lineConfigs[idx], baseline: 0, checkpoint: newStartTime };
                            updates[`${idx}`] = lineConfigs[idx];
                        }
                        oeeData[lineNum] = {...defaultOEE};
                        oeeUpdates[lineNum] = oeeData[lineNum];
                        latestCounter[`L${lineNum}`] = 0;
                    });
                }

                await set(ref(database, 'config/lineConfigs'), updates);
                await set(ref(database, 'config/oeeData'), oeeUpdates);
                if(prodChart) updateBarChart();

                if(window.mqttClient && window.mqttClient.connected) {
                    if(isAll) { 
                        for(let i=1; i<=7; i++) window.mqttClient.publish(`${mqttConfig.topicBase}/machine0${i}/cmd`, JSON.stringify({ cmd: "RESET", reset_source: "web" })); 
                    } else { 
                        window.mqttClient.publish(`${mqttConfig.topicBase}/${targetMachine}/cmd`, JSON.stringify({ cmd: "RESET", reset_source: "web" })); 
                    }
                }
                if (isAll) { for (let i = 1; i <= 15; i++) { latestCounter[`L${i}`] = 0; } }
                updateUI(); 
            }

            window.manualSave = async (isAuto = false) => {
                if(isAuto || confirm("Simpan Data ke History?")) {
                    saveAndReset("MANUAL_SAVE_ONLY"); 
                }
            };

            window.resetCounter = async () => {
                let m = document.getElementById("machineSelectDesktop").value;
                if(window.innerWidth <= 768) { m = document.getElementById("machineSelectMobile").value; }
                if(!m) return alert("Pilih Mesin atau Reset All dulu!");
                if(confirm((m === 'all') ? "RESET SEMUA MESIN?" : `RESET ${m.toUpperCase()}?`)) { await saveAndReset((m === 'all') ? "ALL" : m); }
            };

            async function loadCache() { 
                const localBackup = localStorage.getItem('phi_counter_backup');
                if(localBackup) {
                    try {
                        const parsedLocal = JSON.parse(localBackup);
                        Object.assign(latestCounter, parsedLocal);
                        console.log("Restored from Local Backup");
                    } catch(e) {}
                }
                const snap = await get(ref(database, 'lastCache')); 
                if(snap.exists()) { 
                    const d = snap.val(); 
                    Object.keys(d).forEach(k => { 
                        if(d[k].counter) Object.assign(latestCounter, d[k].counter); 
                    }); 
                } 
            }
            
    window.initChart = () => {
            Chart.register(ChartDataLabels);
            const ctx = document.getElementById('productionChart').getContext('2d');
            const labels = [];
            for(let i=1; i<=15; i++) { if(i!==13) labels.push(`L${i.toString().padStart(2,'0')}`); }

            prodChart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: labels, 
                    datasets: [
                        { 
                            label: 'OEE SCORE %', 
                            data: [], 
                            backgroundColor: (context) => {
                                const val = context.raw;
                                if (val >= 75) return '#4ade80'; // Hijau
                                if (val >= 50) return '#facc15'; // Kuning
                                return '#f87171'; // Merah
                            },
                            borderRadius: 6,
                            barPercentage: 0.8,
                            datalabels: {
                                display: true, 
                                color: '#ffffff', 
                                anchor: 'end', 
                                align: 'top', 
                                rotation: -90, 
                                font: { weight: '800', family: "'JetBrains Mono'", size: 11 },
                                
                                // --- PERBAIKAN DI SINI (LOGIKA OFFSET DINAMIS) ---
                                offset: (context) => {
                                    // Jika nilainya 0 atau kurang, dorong ke ATAS (10px) supaya tidak nabrak
                                    // Jika nilainya ada, tarik ke BAWAH (-20px) seperti sebelumnya
                                    return context.dataset.data[context.dataIndex] <= 0 ? 10 : -20;
                                },
                                // ------------------------------------------------
                                
                                formatter: (value) => value + '%'
                            }
                        }
                    ] 
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, animation: false, 
                    plugins: { 
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    }, 
                    scales: { 
                        x: { grid: { display: false }, ticks: { color: '#ffffff', font: { family: "'JetBrains Mono'", size: 10, weight: 'bold' } } },
                        y: { min: 0, max: 110, grid: { color: '#334155', drawBorder: false }, ticks: { display: false } } 
                    } 
                } 
            });
        };

            function updateBarChart() {
                if (!prodChart) return;
                const oeeDataChart = [];
                
                for(let i=1; i<=15; i++) {
                    if(i === 13) continue;
                    const act = latestCounter[`L${i}`] || 0;
                    
                    // GRAFIK MENGGUNAKAN LOGIKA NETT (OEE)
                    const theo = calculateNetTheoretical(i); 
                    
                    let oeeScore = 0;
                    if (theo > 0) oeeScore = ((act / theo) * 100).toFixed(1);
                    if(oeeScore > 100) oeeScore = 100;
                    oeeDataChart.push(oeeScore);
                }

                prodChart.data.datasets[0].data = oeeDataChart;
                prodChart.update('none'); 
            }

            async function loadHistoryTable() {
                const b = document.getElementById("historyTableBody"); 
                b.innerHTML = "<tr><td colspan='3' style='text-align:center; padding:20px;'>Loading data...</td></tr>"; 
                const snap = await get(ref(database, 'history')); 
                b.innerHTML = "";
                if(snap.exists()) { 
                    Object.values(snap.val()).reverse().forEach(h => { 
                        let totalAct = h.grandTotal || h.total || 0;
                        let totalTheo = h.grandTheoretical ? parseInt(h.grandTheoretical).toLocaleString('id-ID') : "-";
                        let eff = h.globalEfficiency ? h.globalEfficiency : 0;
                        let breakdown = h.globalOEE ? h.globalOEE.breakdown : 0;
                        let effColor = (eff >= 90) ? '#4ade80' : (eff >= 70 ? '#facc15' : '#f87171');

                        b.innerHTML += `
                        <tr style="border-bottom:1px solid #334155;">
                            <td style="padding:15px; font-family:'JetBrains Mono'; vertical-align:top; width:25%;">
                                <div style="color:white; font-weight:bold;">${h.time.split(' ')[0]}</div> 
                                <div style="color:#94a3b8; font-size:0.7rem;">${h.time.split(' ')[1] || ''}</div>
                                <div style="margin-top:5px; font-size:0.65rem; color:#64748b; text-transform:uppercase;">${h.resetType || 'AUTO'}</div>
                            </td>
                            <td style="padding:15px; text-align:center; vertical-align:top; width:25%;">
                                <div style="font-family:'JetBrains Mono'; font-size:1.3rem; font-weight:bold; color:var(--success);">${totalAct}</div>
                                <div style="font-size:0.65rem; color:#64748b;">TOTAL ACTUAL</div>
                            </td>
                            <td style="padding:15px; vertical-align:top; width:50%;">
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; font-size:0.7rem; color:#cbd5e1;">
                                    <div>THEORETICAL</div><div style="text-align:right; font-weight:bold; color:white;">${totalTheo}</div>
                                    <div>EFFICIENCY</div><div style="text-align:right; font-weight:bold; color:${effColor};">${eff}%</div>
                                    <div style="margin-top:4px; border-top:1px solid #334155; padding-top:4px;">BREAKDOWN</div>
                                    <div style="margin-top:4px; border-top:1px solid #334155; padding-top:4px; text-align:right; font-weight:bold; color:#f87171;">${breakdown} min</div>
                                </div>
                            </td>
                        </tr>`; 
                    }); 
                } else { b.innerHTML = "<tr><td colspan='3' style='text-align:center; padding:20px; color:#94a3b8;'>Belum ada data history</td></tr>"; }
            }

            window.downloadRealExcel = async () => {
                const snap = await get(ref(database, 'history')); 
                if (!snap.exists()) return alert("Tidak ada data history!");
                const historyData = Object.values(snap.val()).reverse(); 
                const dataSheet = [["WAKTU LOG", "RESET TYPE", "LINE NAME", "ACTUAL (Pcs)", "THEORETICAL (Pcs)", "EFFICIENCY (%)", "WORKING TIME (Min)", "EXT STOP (Min)", "PLAN DOWN (Min)", "TRIAL/SETUP (Min)", "UNUSED (Min)", "DEFECT (Min)", "SPEED LOSS (Min)", "MINOR STOP (Min)", "BREAKDOWN (Min)"]];
                historyData.forEach(h => {
                    if (h.lineDetails) {
                        Object.keys(h.lineDetails).forEach(key => {
                            const line = h.lineDetails[key]; const oee = line.oee || {};
                            dataSheet.push([
                                h.time, h.resetType || "Auto", key.replace("L", "LINE "), 
                                line.actual, line.theoretical, parseFloat(line.efficiency) || 0, 
                                oee.workingTime || 1440, oee.extStop || 0, oee.planDowntime || 0, oee.trial || 0, oee.unused || 0,
                                oee.defect || 0, oee.speedLoss || 0, oee.minorStop || 0, oee.breakdown || 0
                            ]);
                        });
                        dataSheet.push(Array(15).fill(""));
                    }
                });
                const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(dataSheet);
                ws['!cols'] = Array(15).fill({ wch: 18 }); ws['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
                XLSX.utils.book_append_sheet(wb, ws, "Produksi Detail");
                XLSX.writeFile(wb, `Laporan_Produksi_PHI_${new Date().toISOString().slice(0,10)}.xlsx`);
            };
        </script>
    </body>
    </html>

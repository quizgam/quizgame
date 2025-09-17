<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SI Admin — Prototype (HTML/CSS/JS)</title>
  <style>
    :root{
      --bg:#0f1724; --card:#0b1220; --muted:#94a3b8; --accent:#2f6fbf;
      --panel:#0b1220; --soft:#111827; --ok:#10b981; --warn:#f59e0b; --crit:#ef4444;
      --glass: rgba(255,255,255,0.02);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;background:linear-gradient(180deg,var(--bg),#071022);color:#e6eef8;
      -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
    }
    .app{max-width:1200px;margin:20px auto;padding:18px;display:grid;grid-template-columns:260px 1fr;gap:18px;}
    aside{background:var(--panel);border-radius:12px;padding:14px;box-shadow:0 6px 18px rgba(2,6,23,0.6);}
    header.main{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;background:var(--panel)}
    h1{font-size:18px;margin:0}
    nav button{display:block;width:100%;text-align:left;padding:10px;border-radius:8px;border:0;background:transparent;color:inherit;margin-bottom:6px;cursor:pointer}
    nav button.active{background:rgba(255,255,255,0.03);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.02)}
    .logo{display:flex;align-items:center;gap:8px}
    .logo .dot{width:36px;height:36px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#072033;font-weight:700}
    .small{font-size:12px;color:var(--muted)}
    main.panel{background:var(--panel);border-radius:12px;padding:16px;min-height:600px}
    .grid{display:grid;gap:12px}
    .grid.cols-2{grid-template-columns:1fr 360px}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:12px;border-radius:10px;box-shadow:0 4px 14px rgba(2,6,23,0.6)}
    .row{display:flex;gap:12px;align-items:center}
    .chip{padding:6px 8px;border-radius:999px;font-size:12px}
    .btn{padding:8px 10px;border-radius:8px;border:0;cursor:pointer}
    .btn.primary{background:var(--accent);color:#041426}
    .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.04)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:8px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.03)}
    .status-online{color:var(--ok);font-weight:600}
    .status-off{color:var(--muted)}
    .badge-critical{background:var(--crit);padding:4px 6px;border-radius:6px;font-size:12px}
    .badge-warn{background:var(--warn);padding:4px 6px;border-radius:6px;font-size:12px}
    .badge-info{background:rgba(47,111,191,0.15);color:var(--accent);padding:4px 6px;border-radius:6px;font-size:12px}
    form input, form textarea, form select{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit}
    .muted{color:var(--muted)}
    footer.notes{font-size:12px;color:var(--muted);margin-top:12px}
    @media (max-width:900px){
      .app{grid-template-columns:1fr; padding:10px}
      .grid.cols-2{grid-template-columns:1fr}
      aside{order:2}
      main.panel{order:1}
    }
  </style>
</head>
<body>
  <div class="app" role="application" aria-label="SI Admin Prototype">
    <aside>
      <div class="logo">
        <div class="dot">SI</div>
        <div>
          <strong>SI Admin</strong><div class="small">Prototype — HTML / CSS / JS</div>
        </div>
      </div>

      <nav id="nav" style="margin-top:14px;">
        <button data-route="dashboard" class="active">Tableau de bord</button>
        <button data-route="network">Réseau & Services</button>
        <button data-route="backup">Sauvegardes</button>
        <button data-route="security">Sécurité</button>
        <button data-route="incidents">Incidents</button>
        <button data-route="devices">Périphériques & Accès</button>
        <button data-route="integration">Intégrations</button>
        <button data-route="monitoring">Supervision</button>
        <button data-route="projects">Projets</button>
      </nav>

      <div style="margin-top:14px">
        <div class="small">Alertes récentes</div>
        <ul id="alertsList" style="list-style:none;padding:0;margin:8px 0;max-height:220px;overflow:auto"></ul>
      </div>

      <div style="margin-top:12px" class="small muted">Connecté : admin • Mode test</div>
    </aside>

    <main class="panel">
      <header class="main" aria-hidden>
        <h1 id="routeTitle">Tableau de bord</h1>
        <div class="row">
          <div class="small muted" id="timestamp">—</div>
          <button class="btn ghost" id="btnRefresh">Actualiser</button>
        </div>
      </header>

      <section id="content">
        <!-- Contenu dynamique injecté ici -->
      </section>

      <footer class="notes">
        Ce prototype stocke les données en local (localStorage). Pour production : backend (API), auth, monitoring réel.
      </footer>
    </main>
  </div>

  <script>
    /*********************************************************
     * SI Admin — Prototype en HTML/CSS/JS
     * Fonctionnalités:
     * - Dashboard
     * - Network admin (toggle device)
     * - Backup manager (run backup)
     * - Security center (scan -> score)
     * - Incidents (create/list)
     * - Devices & user access
     * - Integration list
     * - Monitoring (alerts)
     * - Project manager
     *
     * Persistance: localStorage (cle: siadmin_state)
     *********************************************************/

    // ---- mock initial state ----
    const DEFAULT_STATE = {
      alerts: [],
      devices: [
        { id: 1, name:'poste-01', type:'PC', ip:'192.168.1.10', online:true, owner:'user.a' },
        { id: 2, name:'poste-02', type:'PC', ip:'192.168.1.11', online:true, owner:'user.b' },
        { id: 3, name:'serveur-web-01', type:'Serveur', ip:'10.0.0.5', online:true, owner:'infra' },
        { id: 4, name:'serveur-db-01', type:'Serveur', ip:'10.0.0.6', online:false, owner:'infra' }
      ],
      backups: [
        { id:101, name:'Sauvegarde DB - quotidienne', schedule:'daily 02:00', lastRun:null, status:'idle' },
        { id:102, name:'Snapshot VMs - hebdo', schedule:'sun 03:00', lastRun:null, status:'idle' }
      ],
      incidents: [],
      security: { score:78, lastScan:'2025-09-01 10:12', issues:['Patch critique manquant sur serveur-db-01'] },
      projects: [
        { id:201, name:'Mise à jour pare-feu', status:'in-progress', description:'Remplacement du firmware et revue règles' },
        { id:202, name:'Migration sauvegardes vers S3', status:'planning', description:'Étude et POC' }
      ]
    };

    // ---- state utils ----
    const STORAGE_KEY = 'siadmin_state_v1';
    function loadState(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        return JSON.parse(raw);
      }catch(e){
        console.error('loadState',e);
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    }
    function saveState(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // ---- global state ----
    let state = loadState();

    // ---- UI helpers ----
    const content = document.getElementById('content');
    const nav = document.getElementById('nav');
    const routeTitle = document.getElementById('routeTitle');
    const alertsList = document.getElementById('alertsList');
    const timestamp = document.getElementById('timestamp');

    function formatTime(t=new Date()){
      return new Date(t).toLocaleString();
    }

    function renderAlerts(){
      alertsList.innerHTML='';
      if(state.alerts.length===0){
        const li=document.createElement('li'); li.className='small muted'; li.textContent='Aucune alerte'; alertsList.appendChild(li); return;
      }
      state.alerts.slice(0,20).forEach(a=>{
        const li = document.createElement('li');
        li.style.padding='8px'; li.style.marginBottom='6px'; li.style.background='rgba(255,255,255,0.02)'; li.style.borderRadius='8px';
        li.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px">
          <div>
            <div style="font-size:13px">${a.message}</div>
            <div class="small muted">${a.time}</div>
          </div>
          <div style="text-align:right">
            <div class="chip ${a.level==='critical'?'badge-critical':(a.level==='warning'?'badge-warn':'badge-info')}" style="margin-bottom:6px">${a.level}</div>
            <button class="btn ghost" data-ack="${a.id}" style="font-size:12px">OK</button>
          </div>
        </div>`;
        alertsList.appendChild(li);
      });
      // attach ack handlers
      alertsList.querySelectorAll('button[data-ack]').forEach(b=>{
        b.onclick = () => {
          const id = Number(b.getAttribute('data-ack'));
          state.alerts = state.alerts.filter(x=>x.id!==id);
          saveState(); renderAlerts();
        };
      });
    }

    // ---- routing ----
    function setRoute(route){
      // nav active
      nav.querySelectorAll('button').forEach(btn=>btn.classList.toggle('active', btn.dataset.route===route));
      // title
      routeTitle.textContent = {
        dashboard:'Tableau de bord',
        network:'Réseau & Services',
        backup:'Sauvegardes',
        security:'Sécurité',
        incidents:'Incidents',
        devices:'Périphériques & Accès',
        integration:'Intégrations',
        monitoring:'Supervision',
        projects:'Projets'
      }[route] || 'SI Admin';
      // render content
      if(route==='dashboard') renderDashboard();
      else if(route==='network') renderNetwork();
      else if(route==='backup') renderBackup();
      else if(route==='security') renderSecurity();
      else if(route==='incidents') renderIncidents();
      else if(route==='devices') renderDevices();
      else if(route==='integration') renderIntegration();
      else if(route==='monitoring') renderMonitoring();
      else if(route==='projects') renderProjects();
      // update timestamp
      timestamp.textContent = formatTime();
    }

    // attach nav buttons
    nav.querySelectorAll('button').forEach(btn=>{
      btn.onclick = ()=> setRoute(btn.dataset.route);
    });

    // ---- components renderers ----

    function renderDashboard(){
      content.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className='grid cols-2';
      wrapper.innerHTML = `
        <div class="card">
          <h3>Vue d'ensemble</h3>
          <div style="display:flex;gap:12px;margin-top:8px">
            <div style="flex:1">
              <div class="small muted">Postes & serveurs</div>
              <div style="font-size:20px;font-weight:700">${state.devices.filter(d=>d.online).length}/${state.devices.length} en ligne</div>
            </div>
            <div style="flex:1">
              <div class="small muted">Tâches de sauvegarde</div>
              <div style="font-size:20px;font-weight:700">${state.backups.length} planifiées</div>
            </div>
            <div style="flex:1">
              <div class="small muted">Incidents ouverts</div>
              <div style="font-size:20px;font-weight:700">${state.incidents.filter(i=>i.status==='open').length}</div>
            </div>
            <div style="flex:1">
              <div class="small muted">Sécurité</div>
              <div style="font-size:20px;font-weight:700">${state.security.score}%</div>
            </div>
          </div>

          <div style="margin-top:12px;">
            <div style="display:flex;gap:8px">
              <button class="btn primary" id="quickIncident">Créer incident test</button>
              <button class="btn ghost" id="quickBackup">Lancer sauvegarde 1</button>
            </div>
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom:12px">
            <h4>Top incidents récents</h4>
            <div id="miniIncidents"></div>
          </div>

          <div class="card">
            <h4>Recommandations sécurité</h4>
            <ol class="small muted" style="margin-top:8px">
              <li>Mettre à jour les systèmes critiques</li>
              <li>Vérifier les sauvegardes hors site</li>
              <li>Revoir les droits d'accès administrateur</li>
            </ol>
          </div>
        </div>
      `;
      content.appendChild(wrapper);

      // fill incidents
      const mini = document.getElementById('miniIncidents');
      if(state.incidents.length===0) mini.innerHTML = '<div class="small muted">Aucun incident</div>';
      else mini.innerHTML = state.incidents.slice(0,5).map(i=>`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:6px">
        <strong>${i.title}</strong><div class="small muted">${i.priority} • ${i.createdAt}</div></div>`).join('');

      document.getElementById('quickIncident').onclick = ()=>{
        createIncident({ title:'Test: latence réseau', description:'Latence élevée sur segment A', priority:'medium' });
      };
      document.getElementById('quickBackup').onclick = ()=>{
        const b = state.backups[0];
        if(b) runBackup(b.id);
        else alert('Aucune tâche de sauvegarde définie.');
      };
    }

    function renderNetwork(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>Administration réseau & services</h3>
        <p class="small muted">Contrôler équipements réseau et services.</p>
        <div style="margin-top:12px;overflow:auto"><table>
          <thead><tr><th>Nom</th><th>Type</th><th>IP</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody id="devicesTable"></tbody>
        </table></div>`;
      content.appendChild(card);

      const tbody = document.getElementById('devicesTable');
      tbody.innerHTML = state.devices.map(d=>`<tr>
        <td>${d.name}</td><td>${d.type}</td><td>${d.ip}</td>
        <td>${d.online?'<span class="status-online">En ligne</span>':'<span class="status-off">Hors ligne</span>'}</td>
        <td><button class="btn ghost" data-toggle="${d.id}">Basculer</button></td>
      </tr>`).join('');
      tbody.querySelectorAll('button[data-toggle]').forEach(b=>{
        b.onclick = ()=> {
          const id = Number(b.getAttribute('data-toggle'));
          toggleDeviceStatus(id);
          renderNetwork();
        };
      });
    }

    function renderBackup(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>Gestion des sauvegardes</h3><div style="margin-top:12px" id="backupList"></div>`;
      content.appendChild(card);

      const list = document.getElementById('backupList');
      list.innerHTML = state.backups.map(b=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:8px">
          <div>
            <div style="font-weight:700">${b.name}</div>
            <div class="small muted">Schedule: ${b.schedule} • Dernière: ${b.lastRun || '-'}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn primary" data-run="${b.id}">Lancer</button>
            <button class="btn ghost" data-edit="${b.id}">Éditer</button>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('button[data-run]').forEach(b=>{
        b.onclick = ()=> { runBackup(Number(b.getAttribute('data-run'))); renderBackup(); };
      });
    }

    function renderSecurity(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <h3>Centre de sécurité</h3>
        <div style="display:flex;gap:12px;margin-top:12px">
          <div style="flex:2">
            <div class="small muted">Résumé</div>
            <div style="font-size:20px;font-weight:700">${state.security.score}%</div>
            <div class="small muted">Dernier scan: ${state.security.lastScan}</div>
            <div style="margin-top:10px">
              <h4>Vulnérabilités</h4>
              <ul class="small muted" id="secIssues">${state.security.issues.map(i=>`<li>${i}</li>`).join('')}</ul>
            </div>
          </div>
          <div style="flex:1">
            <button class="btn primary" id="runScan">Lancer un scan</button>
            <button class="btn ghost" style="margin-top:8px" id="deployPatch">Déployer correctifs</button>
            <button class="btn ghost" style="margin-top:8px" id="reviewPolicy">Revoir politiques</button>
          </div>
        </div>
      `;
      content.appendChild(card);

      document.getElementById('runScan').onclick = ()=>{
        runSecurityScan();
        renderSecurity();
      };
      document.getElementById('deployPatch').onclick = ()=>{
        alert('Déploiement de correctifs simulé (POC). En production, vous lanceriez playbooks/ansible/patch manager.');
      };
    }

    function renderIncidents(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <h3>Gestion des incidents</h3>
        <div style="display:flex;gap:12px;margin-top:12px">
          <div style="flex:1">
            <h4>Créer un incident</h4>
            <form id="incidentForm">
              <input name="title" placeholder="Titre" required />
              <textarea name="description" placeholder="Description" style="margin-top:8px"></textarea>
              <select name="priority" style="margin-top:8px">
                <option value="low">Bas</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
              </select>
              <div style="margin-top:8px"><button class="btn primary" type="submit">Créer</button></div>
            </form>
          </div>
          <div style="flex:1">
            <h4>Incidents récents</h4>
            <div id="incidentList" style="margin-top:8px"></div>
          </div>
        </div>
      `;
      content.appendChild(card);

      const form = document.getElementById('incidentForm');
      form.onsubmit = (ev)=>{
        ev.preventDefault();
        const fd = new FormData(form);
        createIncident({ title: fd.get('title'), description: fd.get('description'), priority: fd.get('priority') });
        form.reset();
        renderIncidents();
      };

      const list = document.getElementById('incidentList');
      list.innerHTML = state.incidents.length===0 ? '<div class="small muted">Aucun incident</div>' :
        state.incidents.map(i=>`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:6px">
          <strong>${i.title}</strong> <div class="small muted">${i.priority} • ${i.status}</div>
          <div class="small muted">${i.createdAt}</div>
        </div>`).join('');
    }

    function renderDevices(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <h3>Gestion des périphériques & accès</h3>
        <div style="margin-top:12px;overflow:auto">
          <table><thead><tr><th>Nom</th><th>IP</th><th>Type</th><th>Propriétaire</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody id="devsTable"></tbody>
          </table>
        </div>
      `;
      content.appendChild(card);
      const tbody = document.getElementById('devsTable');
      tbody.innerHTML = state.devices.map(d=>`<tr>
        <td>${d.name}</td><td>${d.ip}</td><td>${d.type}</td><td>${d.owner||'-'}</td>
        <td>${d.online?'<span class="status-online">En ligne</span>':'<span class="status-off">Hors ligne</span>'}</td>
        <td><button class="btn ghost" data-toggle="${d.id}">Basculer</button></td>
      </tr>`).join('');
      tbody.querySelectorAll('button[data-toggle]').forEach(b=>{
        b.onclick = ()=>{ toggleDeviceStatus(Number(b.getAttribute('data-toggle'))); renderDevices(); };
      });
    }

    function renderIntegration(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>Intégrations possibles</h3>
        <p class="small muted">Connecteurs et solutions à intégrer :</p>
        <ul class="small muted" style="margin-top:8px">
          <li>Active Directory / LDAP</li>
          <li>Solutions de sauvegarde cloud (S3, Backblaze)</li>
          <li>Outils de supervision (Prometheus, Nagios)</li>
          <li>SIEM / Analyse (Splunk, ELK)</li>
        </ul>
        <div style="margin-top:12px"><button class="btn primary" id="addConnector">Ajouter un connecteur</button></div>
      `;
      content.appendChild(card);
      document.getElementById('addConnector').onclick = ()=> alert('Action simulée: ajouter connecteur (à implémenter côté backend).');
    }

    function renderMonitoring(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<h3>Supervision & Performance</h3>
      <p class="small muted">Flux d'alertes récentes et métriques temps réel (simulées).</p>
      <div id="monitorList" style="margin-top:12px"></div>`;
      content.appendChild(card);
      const mon = document.getElementById('monitorList');
      mon.innerHTML = state.alerts.length===0 ? '<div class="small muted">Aucune alerte</div>' :
        state.alerts.map(a=>`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:6px">
          <div style="display:flex;justify-content:space-between"><div><strong>${a.message}</strong></div><div class="${a.level==='critical'?'badge-critical':'badge-warn'}">${a.level}</div></div>
          <div class="small muted">${a.time}</div>
        </div>`).join('');
    }

    function renderProjects(){
      content.innerHTML = '';
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `
        <h3>Pilotage de projets</h3>
        <div style="display:flex;gap:12px;margin-top:12px">
          <div style="flex:1">
            <h4>Nouveau projet</h4>
            <form id="projForm">
              <input name="name" placeholder="Nom du projet" required/>
              <textarea name="description" placeholder="Description" style="margin-top:8px"></textarea>
              <div style="margin-top:8px"><button class="btn primary" type="submit">Ajouter</button></div>
            </form>
          </div>
          <div style="flex:1">
            <h4>Projets récents</h4>
            <div id="projList" style="margin-top:8px"></div>
          </div>
        </div>
      `;
      content.appendChild(card);

      document.getElementById('projForm').onsubmit = (ev)=>{
        ev.preventDefault();
        const fd = new FormData(ev.target);
        addProject({ name: fd.get('name'), description: fd.get('description') }); ev.target.reset(); renderProjects();
      };

      const list = document.getElementById('projList');
      list.innerHTML = state.projects.length===0 ? '<div class="small muted">Aucun projet</div>' :
        state.projects.map(p=>`<div style="padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);margin-bottom:6px">
          <div style="display:flex;justify-content:space-between"><strong>${p.name}</strong><span class="small muted">${p.status}</span></div>
          <div class="small muted">${p.description}</div>
        </div>`).join('');
    }

    // ---- actions ----
    function pushAlert(level, message){
      const a = { id: Date.now(), level, message, time: formatTime() };
      state.alerts.unshift(a);
      if(state.alerts.length>40) state.alerts.pop();
      saveState(); renderAlerts();
    }

    function createIncident({ title, description, priority='low' }){
      const inc = { id:Date.now(), title, description, priority, status:'open', createdAt:formatTime() };
      state.incidents.unshift(inc);
      // create alert
      pushAlert('warning', `Incident créé: ${title}`);
      saveState();
    }

    function toggleDeviceStatus(id){
      state.devices = state.devices.map(d=> d.id===id? {...d, online:!d.online}:d );
      saveState();
      pushAlert('info', `Statut basculé: ${state.devices.find(d=>d.id===id).name}`);
    }

    function runBackup(taskId){
      const b = state.backups.find(x=>x.id===taskId);
      if(!b) return alert('Tâche non trouvée');
      b.lastRun = formatTime();
      b.status = 'success';
      saveState();
      pushAlert('info', `Sauvegarde exécutée : ${b.name}`);
    }

    function runSecurityScan(){
      // simulate change in score and random issues
      const delta = Math.floor(Math.random()*11)-3; // -3..+7
      state.security.score = Math.min(99, Math.max(40, state.security.score + delta));
      state.security.lastScan = formatTime();
      // maybe add or remove issues
      if(Math.random()>0.6) state.security.issues.push('Compte inactif avec privilèges sur serveur-db-01');
      if(state.security.issues.length>6) state.security.issues = state.security.issues.slice(-6);
      saveState(); pushAlert('info','Scan de sécurité terminé'); 
    }

    function addProject(project){
      const p = { id:Date.now(), status:'planning', name:project.name, description:project.description || '' };
      state.projects.unshift(p); saveState(); pushAlert('info', `Nouveau projet: ${p.name}`);
    }

    // ---- simulated monitoring (generate alerts randomly) ----
    setInterval(()=>{
      if(Math.random()>0.8){
        const messages = [
          'Pic CPU sur serveur-web-02',
          'Perte de paquets sur lien-A',
          'Echec sauvegarde: snapshot VM',
          'Tentative de connexion SSH échouée (IP externe)'
        ];
        const m = messages[Math.floor(Math.random()*messages.length)];
        const level = Math.random()>0.6 ? 'critical' : 'warning';
        pushAlert(level, m);
      }
    },5000);

    // ---- initial rendering ----
    renderAlerts();
    setRoute('dashboard');

    // refresh button
    document.getElementById('btnRefresh').onclick = ()=>{
      saveState();
      renderAlerts();
      setRoute(document.querySelector('#nav button.active').dataset.route);
    };

    // expose some helpers in console for testing
    window.SIAdmin = {
      state, saveState, pushAlert, createIncident, toggleDeviceStatus, runBackup, runSecurityScan, addProject
    };

    // small UX: update timestamp each minute
    setInterval(()=>{ timestamp.textContent = formatTime(); }, 60_000);
  </script>
</body>
</html># quizgame


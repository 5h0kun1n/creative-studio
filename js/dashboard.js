/* ========================================
   Creative Studio - Dashboard Logic
   All data persisted in localStorage
   ======================================== */

// ==================== INITIALIZATION ====================

let currentCalendarDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initSidebar();
    loadChecklist();
    renderCalendar();
    renderPosts();
    updateOverview();
    checkForScrapedLeads();

    document.getElementById('currentDate').textContent =
        new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

function initDashboard() {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchTab(hash);
    populateAllTeamDropdowns();
    renderPipeline();
    renderProspects();
}

function initSidebar() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            if (tab) switchTab(tab);
        });
    });

    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));

    const tab = document.getElementById('tab-' + tabName);
    const nav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (tab) tab.classList.add('active');
    if (nav) nav.classList.add('active');

    window.location.hash = tabName;

    if (tabName === 'overview') updateOverview();
    if (tabName === 'crm') renderPipeline();

    document.getElementById('sidebar')?.classList.remove('open');
}

// ==================== LOCAL STORAGE HELPERS ====================

function getLeads() { return JSON.parse(localStorage.getItem('cs_leads') || '[]'); }
function saveLeads(leads) { localStorage.setItem('cs_leads', JSON.stringify(leads)); }
function getProspects() { return JSON.parse(localStorage.getItem('cs_prospects') || '[]'); }
function saveProspectsData(prospects) { localStorage.setItem('cs_prospects', JSON.stringify(prospects)); }
function getPosts() { return JSON.parse(localStorage.getItem('cs_posts') || '[]'); }
function savePostsData(posts) { localStorage.setItem('cs_posts', JSON.stringify(posts)); }
function getTeam() { return JSON.parse(localStorage.getItem('cs_team') || '[]'); }
function saveTeam(team) { localStorage.setItem('cs_team', JSON.stringify(team)); populateAllTeamDropdowns(); }

// ==================== TEAM MANAGEMENT ====================

function openTeamModal() {
    document.getElementById('teamModal').classList.add('active');
    document.getElementById('newMemberName').value = '';
    renderTeamList();
}

function addTeamMember() {
    const input = document.getElementById('newMemberName');
    const name = input.value.trim();
    if (!name) return;
    const team = getTeam();
    if (team.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        showToast('Team member already exists.', 'error');
        return;
    }
    team.push({ id: Date.now(), name: name, color: getTeamColor(team.length) });
    saveTeam(team);
    input.value = '';
    renderTeamList();
    showToast(`${name} added to the team!`, 'success');
}

function removeTeamMember(id) {
    if (!confirm('Remove this team member? Their assignments will become unassigned.')) return;
    const team = getTeam();
    const member = team.find(m => m.id === id);
    const removedName = member?.name;
    const filtered = team.filter(m => m.id !== id);
    saveTeam(filtered);

    if (removedName) {
        const leads = getLeads();
        leads.forEach(l => { if (l.assignedTo === removedName) l.assignedTo = ''; });
        saveLeads(leads);
        const prospects = getProspects();
        prospects.forEach(p => { if (p.assignedTo === removedName) p.assignedTo = ''; });
        saveProspectsData(prospects);
    }

    renderTeamList();
    renderPipeline();
    renderProspects();
}

function renderTeamList() {
    const team = getTeam();
    const container = document.getElementById('teamMemberList');
    if (!team.length) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gray-400);font-size:0.85rem;">No team members yet. Add your sales team above.</div>';
        return;
    }
    container.innerHTML = team.map(m => `
        <div class="team-member-row">
            <span class="assignee-badge" style="background:${m.color}">${getInitials(m.name)}</span>
            <span style="flex:1;font-weight:500;color:var(--gray-800);font-size:0.9rem;">${esc(m.name)}</span>
            <button class="btn btn-sm btn-danger" onclick="removeTeamMember(${m.id})">Remove</button>
        </div>
    `).join('');
}

const TEAM_COLORS = ['#3b82f6','#8b5cf6','#059669','#d97706','#dc2626','#0891b2','#c026d3','#4f46e5','#ea580c','#65a30d'];
function getTeamColor(idx) { return TEAM_COLORS[idx % TEAM_COLORS.length]; }
function getInitials(name) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }

function populateAllTeamDropdowns() {
    const team = getTeam();
    const selectors = ['#leadAssigned', '#prospectAssigned', '#crmAssigneeFilter', '#prospectAssigneeFilter'];
    selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (!el) return;
        const currentVal = el.value;
        const isFilter = sel.includes('Filter');
        let html = isFilter ? '<option value="all">All Team</option><option value="unassigned">Unassigned</option>' : '<option value="">Unassigned</option>';
        team.forEach(m => { html += `<option value="${esc(m.name)}">${esc(m.name)}</option>`; });
        el.innerHTML = html;
        if (currentVal && [...el.options].some(o => o.value === currentVal)) el.value = currentVal;
    });

    renderPipeline();
    renderProspects();
}

function getMemberColor(name) {
    if (!name) return '#9ca3af';
    const team = getTeam();
    const member = team.find(m => m.name === name);
    return member?.color || '#9ca3af';
}

// ==================== OVERVIEW ====================

function updateOverview() {
    const leads = getLeads();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    document.getElementById('statLeads').textContent = leads.length;
    document.getElementById('statQuotes').textContent = leads.filter(l => l.status === 'quoted').length;
    document.getElementById('statWon').textContent = leads.filter(l => l.status === 'won').length;

    const revenue = leads
        .filter(l => l.status === 'won' && new Date(l.date) >= monthStart)
        .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
    document.getElementById('statRevenue').textContent = '$' + revenue.toLocaleString();

    const recentContainer = document.getElementById('recentLeads');
    const recent = leads.slice(-5).reverse();
    if (recent.length) {
        recentContainer.innerHTML = recent.map(l => `
            <div class="lead-list-item">
                <div>
                    <div class="lead-name">${esc(l.name)}</div>
                    <div class="lead-detail">${esc(l.service || 'No service specified')} &bull; ${formatDate(l.date)}</div>
                </div>
                <span class="status-badge ${l.status}">${l.status}</span>
            </div>
        `).join('');
    } else {
        recentContainer.innerHTML = '<div class="empty-state"><p>No leads yet. They\'ll appear here as they come in.</p></div>';
    }

    const followupContainer = document.getElementById('upcomingFollowups');
    const today = now.toISOString().split('T')[0];
    const upcoming = leads
        .filter(l => l.followup && l.followup >= today && l.status !== 'won' && l.status !== 'lost')
        .sort((a, b) => a.followup.localeCompare(b.followup))
        .slice(0, 5);

    if (upcoming.length) {
        followupContainer.innerHTML = upcoming.map(l => `
            <div class="lead-list-item">
                <div>
                    <div class="lead-name">${esc(l.name)}</div>
                    <div class="lead-detail">${esc(l.service || '')} &bull; Follow up: ${formatDate(l.followup)}</div>
                </div>
                <button class="btn btn-sm btn-outline" onclick="editLead(${l.id})">View</button>
            </div>
        `).join('');
    } else {
        followupContainer.innerHTML = '<div class="empty-state"><p>No follow-ups scheduled.</p></div>';
    }
}

// ==================== CRM / LEADS ====================

function openLeadModal(leadId) {
    const modal = document.getElementById('leadModal');
    const form = document.getElementById('leadForm');
    form.reset();
    document.getElementById('leadId').value = '';
    document.getElementById('leadModalTitle').textContent = 'Add New Lead';
    populateAllTeamDropdowns();

    if (leadId) {
        const lead = getLeads().find(l => l.id === leadId);
        if (lead) {
            document.getElementById('leadModalTitle').textContent = 'Edit Lead';
            document.getElementById('leadId').value = lead.id;
            document.getElementById('leadName').value = lead.name || '';
            document.getElementById('leadBusiness').value = lead.business || '';
            document.getElementById('leadPhone').value = lead.phone || '';
            document.getElementById('leadEmail').value = lead.email || '';
            document.getElementById('leadService').value = lead.service || '';
            document.getElementById('leadValue').value = lead.value || '';
            document.getElementById('leadAssigned').value = lead.assignedTo || '';
            document.getElementById('leadStatus').value = lead.status || 'new';
            document.getElementById('leadSource').value = lead.source || 'website';
            document.getElementById('leadFollowup').value = lead.followup || '';
            document.getElementById('leadNotes').value = lead.notes || '';
            document.getElementById('leadCallDate').value = lead.callDate || '';
            document.getElementById('leadCallNotes').value = lead.callNotes || '';
        }
    }

    modal.classList.add('active');
}

function editLead(id) {
    switchTab('crm');
    setTimeout(() => openLeadModal(id), 100);
}

function saveLead(e) {
    e.preventDefault();
    const leads = getLeads();
    const id = document.getElementById('leadId').value;

    const leadData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('leadName').value,
        business: document.getElementById('leadBusiness').value,
        phone: document.getElementById('leadPhone').value,
        email: document.getElementById('leadEmail').value,
        service: document.getElementById('leadService').value,
        value: document.getElementById('leadValue').value,
        assignedTo: document.getElementById('leadAssigned').value,
        status: document.getElementById('leadStatus').value,
        source: document.getElementById('leadSource').value,
        followup: document.getElementById('leadFollowup').value,
        notes: document.getElementById('leadNotes').value,
        callDate: document.getElementById('leadCallDate').value,
        callNotes: document.getElementById('leadCallNotes').value,
        date: id ? (leads.find(l => l.id === parseInt(id))?.date || new Date().toISOString()) : new Date().toISOString()
    };

    if (id) {
        const idx = leads.findIndex(l => l.id === parseInt(id));
        if (idx !== -1) leads[idx] = leadData;
    } else {
        leads.push(leadData);
    }

    saveLeads(leads);
    closeModal('leadModal');
    renderPipeline();
    updateOverview();
    showToast(id ? 'Lead updated!' : 'New lead added!', 'success');
}

function deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    const leads = getLeads().filter(l => l.id !== id);
    saveLeads(leads);
    renderPipeline();
    updateOverview();
    showToast('Lead deleted.', '');
}

function moveLeadStatus(id, newStatus) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
        lead.status = newStatus;
        saveLeads(leads);
        renderPipeline();
        updateOverview();
    }
}

function renderPipeline() {
    const leads = getLeads();
    const statuses = ['new', 'contacted', 'quoted', 'won', 'lost'];
    const assigneeFilter = document.getElementById('crmAssigneeFilter')?.value || 'all';

    statuses.forEach(status => {
        const container = document.getElementById('pipeline-' + status);
        const countEl = document.getElementById('count-' + status);
        let filtered = leads.filter(l => l.status === status);

        if (assigneeFilter === 'unassigned') filtered = filtered.filter(l => !l.assignedTo);
        else if (assigneeFilter !== 'all') filtered = filtered.filter(l => l.assignedTo === assigneeFilter);

        countEl.textContent = filtered.length;

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:#9ca3af;font-size:0.8rem;">No leads</div>';
            return;
        }

        const nextStatus = { new: 'contacted', contacted: 'quoted', quoted: 'won' };
        container.innerHTML = filtered.map(l => `
            <div class="pipeline-card" onclick="openLeadModal(${l.id})">
                <div class="card-top-row">
                    <h5>${esc(l.name)}</h5>
                    <span class="assignee-badge-sm" style="background:${getMemberColor(l.assignedTo)}" onclick="event.stopPropagation(); toggleQuickAssign(event, 'lead', ${l.id})" title="${l.assignedTo ? esc(l.assignedTo) : 'Unassigned'}">${l.assignedTo ? getInitials(l.assignedTo) : '?'}</span>
                </div>
                ${l.business ? `<div class="card-detail">${esc(l.business)}</div>` : ''}
                <div class="card-detail">${esc(l.service || 'No service')}</div>
                ${l.callNotes ? `<div class="card-detail" style="color:var(--primary);font-style:italic;">${esc(l.callNotes)}</div>` : ''}
                ${l.value ? `<div class="card-value">$${parseFloat(l.value).toLocaleString()}</div>` : ''}
                <div class="card-actions">
                    ${nextStatus[status] ? `<button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); moveLeadStatus(${l.id}, '${nextStatus[status]}')">Move →</button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteLead(${l.id})">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

// ==================== PRICING CALCULATOR ====================

const PRICING = {
    'full-wrap': {
        label: 'Full Vehicle Wrap',
        vehicles: {
            'car': { label: 'Car / Sedan', base: 2200 },
            'suv': { label: 'SUV / Crossover', base: 2800 },
            'pickup': { label: 'Pickup Truck', base: 2600 },
            'van': { label: 'Cargo Van', base: 3200 },
            'sprinter': { label: 'Sprinter / Large Van', base: 4000 },
            'box-truck': { label: 'Box Truck', base: 4500 },
            'trailer': { label: 'Trailer', base: 2000 }
        },
        materialOptions: true
    },
    'partial-wrap': {
        label: 'Partial Vehicle Wrap',
        vehicles: {
            'car': { label: 'Car / Sedan', base: 900 },
            'suv': { label: 'SUV / Crossover', base: 1100 },
            'pickup': { label: 'Pickup Truck', base: 1000 },
            'van': { label: 'Cargo Van', base: 1400 },
            'sprinter': { label: 'Sprinter / Large Van', base: 1800 },
            'box-truck': { label: 'Box Truck', base: 2200 },
            'trailer': { label: 'Trailer', base: 1000 }
        },
        materialOptions: true
    },
    'lettering': {
        label: 'Vinyl Lettering',
        sqftPrice: 10,
        fields: ['sqft']
    },
    'storefront': {
        label: 'Storefront Sign',
        options: {
            'small': { label: 'Small (up to 4x4 ft)', base: 600 },
            'medium': { label: 'Medium (up to 4x8 ft)', base: 1200 },
            'large': { label: 'Large (up to 4x12 ft)', base: 2000 },
            'channel': { label: 'Channel Letters (per letter)', base: 200 }
        }
    },
    'banner': {
        label: 'Banner',
        sqftPrice: 4.5,
        fields: ['dimensions']
    },
    'yard-signs': {
        label: 'Yard Signs (18x24 Coroplast)',
        perUnit: 15,
        fields: ['quantity-only']
    },
    'wall-graphics': {
        label: 'Wall Graphics / Murals',
        sqftPrice: 18,
        fields: ['sqft']
    },
    'window-perf': {
        label: 'Window Perforated Film',
        sqftPrice: 16,
        fields: ['sqft']
    }
};

function updatePricingForm() {
    const service = document.getElementById('calcService').value;
    const container = document.getElementById('pricingFields');
    if (!service) { container.innerHTML = ''; return; }

    const config = PRICING[service];
    let html = '';

    if (config.vehicles) {
        html += `<div class="form-group"><label>Vehicle Type</label><select id="calcVehicle">`;
        for (const [key, v] of Object.entries(config.vehicles)) {
            html += `<option value="${key}">${v.label} (from $${v.base.toLocaleString()})</option>`;
        }
        html += `</select></div>`;

        if (config.materialOptions) {
            html += `<div class="form-group"><label>Vinyl Material</label><select id="calcMaterial">
                <option value="standard">Standard Cast Vinyl — Included</option>
                <option value="premium">3M 1080 / Avery Supreme — +$300</option>
                <option value="specialty">Specialty (Chrome, Color Shift) — +$800</option>
            </select></div>`;
        }
    }

    if (config.options) {
        html += `<div class="form-group"><label>Size / Type</label><select id="calcOption">`;
        for (const [key, o] of Object.entries(config.options)) {
            html += `<option value="${key}">${o.label} — $${o.base}</option>`;
        }
        html += `</select></div>`;
    }

    if (config.fields?.includes('sqft')) {
        html += `<div class="form-row">
            <div class="form-group"><label>Width (feet)</label><input type="number" id="calcWidth" value="4" min="1" step="0.5"></div>
            <div class="form-group"><label>Height (feet)</label><input type="number" id="calcHeight" value="3" min="1" step="0.5"></div>
        </div>`;
    }

    if (config.fields?.includes('dimensions')) {
        html += `<div class="form-row">
            <div class="form-group"><label>Width (feet)</label><input type="number" id="calcWidth" value="6" min="1" step="0.5"></div>
            <div class="form-group"><label>Height (feet)</label><input type="number" id="calcHeight" value="3" min="1" step="0.5"></div>
        </div>`;
    }

    container.innerHTML = html;
}

function calculatePrice() {
    const service = document.getElementById('calcService').value;
    if (!service) {
        showToast('Please select a service first', 'error');
        return;
    }

    const config = PRICING[service];
    const design = document.getElementById('calcDesign').value;
    const rush = document.getElementById('calcRush').value;
    const qty = parseInt(document.getElementById('calcQty').value) || 1;

    let basePrice = 0;
    let lines = [];

    if (config.vehicles) {
        const vehicle = document.getElementById('calcVehicle')?.value;
        const vehicleConfig = config.vehicles[vehicle];
        basePrice = vehicleConfig.base;
        lines.push({ label: `${config.label} — ${vehicleConfig.label}`, value: basePrice });

        if (config.materialOptions) {
            const material = document.getElementById('calcMaterial')?.value;
            const materialUpcharge = { standard: 0, premium: 300, specialty: 800 };
            if (materialUpcharge[material]) {
                basePrice += materialUpcharge[material];
                lines.push({ label: 'Material Upgrade', value: materialUpcharge[material] });
            }
        }
    } else if (config.options) {
        const option = document.getElementById('calcOption')?.value;
        basePrice = config.options[option].base;
        lines.push({ label: `${config.label} — ${config.options[option].label}`, value: basePrice });
    } else if (config.sqftPrice) {
        const w = parseFloat(document.getElementById('calcWidth')?.value) || 4;
        const h = parseFloat(document.getElementById('calcHeight')?.value) || 3;
        const sqft = w * h;
        basePrice = sqft * config.sqftPrice;
        lines.push({ label: `${config.label} (${w}×${h} ft = ${sqft} sq ft @ $${config.sqftPrice}/sqft)`, value: basePrice });
    } else if (config.perUnit) {
        basePrice = config.perUnit;
        lines.push({ label: `${config.label} (per sign)`, value: basePrice });
    }

    const designUpcharge = { simple: 0, moderate: 150, complex: 350 };
    if (designUpcharge[design]) {
        lines.push({ label: 'Design: ' + (design === 'moderate' ? 'Custom Layout' : 'Full Custom Art'), value: designUpcharge[design] });
        basePrice += designUpcharge[design];
    }

    let subtotal = basePrice * qty;
    if (qty > 1) {
        lines.push({ label: `Quantity: ${qty}`, value: subtotal - basePrice });
    }

    const rushMultiplier = { standard: 0, rush: 0.25, sameday: 0.50 };
    let rushFee = 0;
    if (rushMultiplier[rush]) {
        rushFee = subtotal * rushMultiplier[rush];
        lines.push({ label: `Rush Fee (${rush === 'rush' ? '1-2 day' : 'Same day'})`, value: rushFee });
    }

    let discount = 0;
    if (qty >= 10) { discount = 0.15; }
    else if (qty >= 5) { discount = 0.10; }
    else if (qty >= 3) { discount = 0.05; }

    let total = subtotal + rushFee;
    if (discount) {
        const discountAmt = subtotal * discount;
        lines.push({ label: `Volume Discount (${(discount * 100)}% off)`, value: -discountAmt });
        total -= discountAmt;
    }

    const result = document.getElementById('quoteResult');
    result.innerHTML = `
        <div class="quote-summary">
            ${lines.map(l => `
                <div class="quote-line">
                    <span class="label">${l.label}</span>
                    <span class="value">${l.value < 0 ? '-' : ''}$${Math.abs(l.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
            `).join('')}
            <div class="quote-line total">
                <span class="label">Estimated Total</span>
                <span class="value">$${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
        </div>
        <p style="font-size:0.78rem;color:var(--gray-400);margin-top:12px;text-align:center;">
            This is an estimate. Final pricing depends on design complexity, vehicle condition, and site specifics.
        </p>
        <div class="quote-actions">
            <button class="btn btn-primary btn-block" onclick="saveQuoteAsLead(${total})">Save as Lead</button>
        </div>
    `;
}

function saveQuoteAsLead(amount) {
    const service = document.getElementById('calcService');
    openLeadModal();
    document.getElementById('leadService').value = PRICING[service.value]?.label || '';
    document.getElementById('leadValue').value = Math.round(amount);
    document.getElementById('leadStatus').value = 'quoted';
    showToast('Fill in customer details to save this quote as a lead.', 'success');
}

// ==================== LEAD GENERATION / PROSPECTS ====================

function openProspectModal(prospectId) {
    const modal = document.getElementById('prospectModal');
    const form = document.getElementById('prospectForm');
    form.reset();
    document.getElementById('prospectId').value = '';
    populateAllTeamDropdowns();

    if (prospectId) {
        const prospect = getProspects().find(p => p.id === prospectId);
        if (prospect) {
            document.getElementById('prospectId').value = prospect.id;
            document.getElementById('prospectName').value = prospect.name || '';
            document.getElementById('prospectContact').value = prospect.contact || '';
            document.getElementById('prospectPhone').value = prospect.phone || '';
            document.getElementById('prospectEmail2').value = prospect.email || '';
            document.getElementById('prospectCategory').value = prospect.category || 'contractor';
            document.getElementById('prospectStatusField').value = prospect.status || 'not-contacted';
            document.getElementById('prospectAssigned').value = prospect.assignedTo || '';
            document.getElementById('prospectCallDate').value = prospect.callDate || '';
            document.getElementById('prospectOpportunity').value = prospect.opportunity || '';
            document.getElementById('prospectCallNotes').value = prospect.callNotes || '';
            document.getElementById('prospectNotes').value = prospect.notes || '';
        }
    }

    modal.classList.add('active');
}

function saveProspect(e) {
    e.preventDefault();
    const prospects = getProspects();
    const id = document.getElementById('prospectId').value;

    const existing = id ? prospects.find(p => p.id === parseInt(id)) : null;
    const data = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('prospectName').value,
        contact: document.getElementById('prospectContact').value,
        phone: document.getElementById('prospectPhone').value,
        email: document.getElementById('prospectEmail2').value,
        category: document.getElementById('prospectCategory').value,
        status: document.getElementById('prospectStatusField').value,
        assignedTo: document.getElementById('prospectAssigned').value,
        callDate: document.getElementById('prospectCallDate').value,
        callNotes: document.getElementById('prospectCallNotes').value,
        opportunity: document.getElementById('prospectOpportunity').value,
        notes: document.getElementById('prospectNotes').value,
        address: existing?.address || '',
        website: existing?.website || '',
        date: existing?.date || new Date().toISOString()
    };

    if (id) {
        const idx = prospects.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) prospects[idx] = data;
    } else {
        prospects.push(data);
    }

    saveProspectsData(prospects);
    closeModal('prospectModal');
    renderProspects();
    showToast(id ? 'Prospect updated!' : 'Prospect added!', 'success');
}

function deleteProspect(id) {
    if (!confirm('Remove this prospect?')) return;
    const prospects = getProspects().filter(p => p.id !== id);
    saveProspectsData(prospects);
    renderProspects();
    showToast('Prospect removed.', '');
}

function convertToLead(id) {
    const prospect = getProspects().find(p => p.id === id);
    if (!prospect) return;

    switchTab('crm');
    setTimeout(() => {
        openLeadModal();
        document.getElementById('leadName').value = prospect.contact || prospect.name;
        document.getElementById('leadBusiness').value = prospect.name;
        document.getElementById('leadPhone').value = prospect.phone || '';
        document.getElementById('leadEmail').value = prospect.email || '';
        document.getElementById('leadSource').value = 'outreach';
        document.getElementById('leadNotes').value = prospect.opportunity || '';
        document.getElementById('leadAssigned').value = prospect.assignedTo || '';
        document.getElementById('leadCallDate').value = prospect.callDate || '';
        document.getElementById('leadCallNotes').value = prospect.callNotes || '';
    }, 150);
}

function clearAllProspects() {
    if (!confirm('Delete ALL prospects? This cannot be undone.')) return;
    localStorage.removeItem('cs_prospects');
    renderProspects();
    showToast('All prospects cleared.', 'success');
}

function filterProspects(category) {
    document.getElementById('prospectFilter').value = category;
    renderProspects();
}

function renderProspects() {
    const prospects = getProspects();
    const catFilter = document.getElementById('prospectFilter').value;
    const statusFilter = document.getElementById('prospectStatus').value;
    const assigneeFilter = document.getElementById('prospectAssigneeFilter')?.value || 'all';
    const container = document.getElementById('prospectList');

    let filtered = prospects;
    if (catFilter !== 'all') filtered = filtered.filter(p => p.category === catFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);
    if (assigneeFilter === 'unassigned') filtered = filtered.filter(p => !p.assignedTo);
    else if (assigneeFilter !== 'all') filtered = filtered.filter(p => p.assignedTo === assigneeFilter);

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state"><p>No prospects match your filters. Add some using the "+ Add Prospect" button.</p></div>';
        return;
    }

    const catLabels = {
        contractor: 'Contractor', realestate: 'Real Estate', food: 'Food & Bev',
        landscaping: 'Landscaping', auto: 'Automotive', retail: 'Retail'
    };

    container.innerHTML = filtered.map(p => `
        <div class="prospect-row">
            <div>
                <strong>${esc(p.name)}</strong>
                <span class="sub">${esc(p.contact || '')}</span>
                ${p.address ? `<span class="sub">${esc(p.address)}</span>` : ''}
            </div>
            <div>
                <span class="cat-badge cat-${p.category || 'contractor'}">${catLabels[p.category] || p.category || 'Other'}</span>
            </div>
            <div>
                ${p.phone ? `<a href="tel:${p.phone}" style="color:var(--primary);font-weight:600;font-size:0.85rem;">${esc(p.phone)}</a>` : '<span class="sub">No phone</span>'}
                ${p.website ? `<br><a href="${esc(p.website)}" target="_blank" style="font-size:0.75rem;color:var(--gray-500);">Website →</a>` : ''}
            </div>
            <div>
                <span class="assignee-badge-sm" style="background:${getMemberColor(p.assignedTo)}" onclick="event.stopPropagation(); toggleQuickAssign(event, 'prospect', ${p.id})" title="${p.assignedTo ? esc(p.assignedTo) : 'Unassigned'}">${p.assignedTo ? getInitials(p.assignedTo) : '?'}</span>
                ${p.assignedTo ? `<span class="sub" style="margin-left:4px;">${esc(p.assignedTo)}</span>` : ''}
                ${p.callNotes ? `<div class="sub" style="color:var(--primary);font-style:italic;margin-top:2px;">${esc(p.callNotes)}</div>` : ''}
            </div>
            <div><span class="status-badge ${p.status}">${(p.status || '').replace('-', ' ')}</span></div>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-sm btn-outline" onclick="convertToLead(${p.id})">→ Lead</button>
                <button class="btn btn-sm btn-outline" onclick="openProspectModal(${p.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProspect(${p.id})">×</button>
            </div>
        </div>
    `).join('');
}

// Checklist persistence
function saveChecklist() {
    const checks = [];
    document.querySelectorAll('#prospectChecklist input[type="checkbox"]').forEach(cb => {
        checks.push(cb.checked);
    });
    localStorage.setItem('cs_checklist', JSON.stringify(checks));
}

function loadChecklist() {
    const checks = JSON.parse(localStorage.getItem('cs_checklist') || '[]');
    const checkboxes = document.querySelectorAll('#prospectChecklist input[type="checkbox"]');
    checks.forEach((val, i) => {
        if (checkboxes[i]) checkboxes[i].checked = val;
    });
}

function resetChecklist() {
    document.querySelectorAll('#prospectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    localStorage.removeItem('cs_checklist');
    showToast('Checklist reset for the new week!', 'success');
}

// ==================== SOCIAL MEDIA CALENDAR ====================

function openPostModal(postId) {
    const modal = document.getElementById('postModal');
    const form = document.getElementById('postForm');
    form.reset();
    document.getElementById('postId').value = '';

    if (postId) {
        const post = getPosts().find(p => p.id === postId);
        if (post) {
            document.getElementById('postId').value = post.id;
            document.getElementById('postPlatform').value = post.platform || 'instagram';
            document.getElementById('postDate').value = post.date || '';
            document.getElementById('postType').value = post.type || 'photo';
            document.getElementById('postCaption').value = post.caption || '';
            document.getElementById('postHashtags').value = post.hashtags || '';
            document.getElementById('postStatus').value = post.postStatus || 'draft';
        }
    } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('postDate').value = tomorrow.toISOString().split('T')[0];
    }

    modal.classList.add('active');
}

function savePost(e) {
    e.preventDefault();
    const posts = getPosts();
    const id = document.getElementById('postId').value;

    const data = {
        id: id ? parseInt(id) : Date.now(),
        platform: document.getElementById('postPlatform').value,
        date: document.getElementById('postDate').value,
        type: document.getElementById('postType').value,
        caption: document.getElementById('postCaption').value,
        hashtags: document.getElementById('postHashtags').value,
        postStatus: document.getElementById('postStatus').value
    };

    if (id) {
        const idx = posts.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) posts[idx] = data;
    } else {
        posts.push(data);
    }

    savePostsData(posts);
    closeModal('postModal');
    renderCalendar();
    renderPosts();
    showToast(id ? 'Post updated!' : 'Post scheduled!', 'success');
}

function deletePost(id) {
    if (!confirm('Delete this post?')) return;
    const posts = getPosts().filter(p => p.id !== id);
    savePostsData(posts);
    renderCalendar();
    renderPosts();
    showToast('Post deleted.', '');
}

function renderCalendar() {
    const cal = document.getElementById('socialCalendar');
    const d = currentCalendarDate;
    const year = d.getFullYear();
    const month = d.getMonth();

    document.getElementById('calendarMonth').textContent =
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();
    const posts = getPosts();

    let html = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(name => {
        html += `<div class="cal-header">${name}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        const day = daysInPrev - firstDay + i + 1;
        html += `<div class="cal-day other-month"><span class="day-num">${day}</span></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const dayPosts = posts.filter(p => p.date === dateStr);

        html += `<div class="cal-day ${isToday ? 'today' : ''}" onclick="openPostModal(); document.getElementById('postDate').value='${dateStr}'">
            <span class="day-num">${day}</span>
            ${dayPosts.map(p => `<div class="cal-post ${p.platform}">${p.platform}</div>`).join('')}
        </div>`;
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="cal-day other-month"><span class="day-num">${i}</span></div>`;
    }

    cal.innerHTML = html;
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

function renderPosts() {
    const posts = getPosts();
    const platformFilter = document.getElementById('postPlatformFilter')?.value || 'all';
    const container = document.getElementById('scheduledPosts');

    let filtered = posts;
    if (platformFilter !== 'all') filtered = filtered.filter(p => p.platform === platformFilter);
    filtered.sort((a, b) => a.date.localeCompare(b.date));

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state"><p>No posts scheduled. Click "+ Schedule Post" to get started.</p></div>';
        return;
    }

    container.innerHTML = filtered.map(p => `
        <div class="post-row">
            <span class="platform-badge ${p.platform}">${p.platform}</span>
            <div>
                <strong style="font-size:0.85rem;color:var(--gray-800);">${esc(p.caption.substring(0, 80))}${p.caption.length > 80 ? '...' : ''}</strong>
            </div>
            <div style="font-size:0.82rem;color:var(--gray-500);">${formatDate(p.date)}</div>
            <div><span class="status-badge ${p.postStatus === 'posted' ? 'interested' : p.postStatus === 'scheduled' ? 'contacted' : 'not-contacted'}">${p.postStatus}</span></div>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-sm btn-outline" onclick="openPostModal(${p.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deletePost(${p.id})">×</button>
            </div>
        </div>
    `).join('');
}

function useIdea(el) {
    openPostModal();
    const title = el.querySelector('strong').textContent;
    const desc = el.querySelector('p').textContent;
    document.getElementById('postCaption').value = `${title}\n\n${desc}`;
}

function copyTemplate(btn) {
    const text = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Caption copied to clipboard!', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('Caption copied!', 'success');
    });
}

// ==================== QUICK ASSIGN ====================

function toggleQuickAssign(event, type, id) {
    event.stopPropagation();
    closeQuickAssign();

    const team = getTeam();
    if (!team.length) { showToast('Add team members first via "Manage Team"', 'error'); return; }

    const rect = event.target.getBoundingClientRect();
    const dropdown = document.createElement('div');
    dropdown.className = 'quick-assign-dropdown';
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.left = rect.left + 'px';

    let html = `<div class="qa-option" onclick="quickAssign('${type}', ${id}, '')">
        <span class="assignee-badge-sm" style="background:#9ca3af">?</span> Unassigned
    </div>`;
    team.forEach(m => {
        html += `<div class="qa-option" onclick="quickAssign('${type}', ${id}, '${esc(m.name)}')">
            <span class="assignee-badge-sm" style="background:${m.color}">${getInitials(m.name)}</span> ${esc(m.name)}
        </div>`;
    });

    dropdown.innerHTML = html;
    document.body.appendChild(dropdown);

    setTimeout(() => document.addEventListener('click', closeQuickAssign, { once: true }), 10);
}

function quickAssign(type, id, memberName) {
    if (type === 'lead') {
        const leads = getLeads();
        const lead = leads.find(l => l.id === id);
        if (lead) { lead.assignedTo = memberName; saveLeads(leads); renderPipeline(); updateOverview(); }
    } else {
        const prospects = getProspects();
        const prospect = prospects.find(p => p.id === id);
        if (prospect) { prospect.assignedTo = memberName; saveProspectsData(prospects); renderProspects(); }
    }
    closeQuickAssign();
    showToast(memberName ? `Assigned to ${memberName}` : 'Unassigned', 'success');
}

function closeQuickAssign() {
    document.querySelectorAll('.quick-assign-dropdown').forEach(d => d.remove());
}

// ==================== UTILITIES ====================

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
}

function showToast(message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==================== NC SOS PASTE IMPORT ====================

function importNCSOSPaste() {
    const textarea = document.getElementById('ncsosPasteBox');
    const statusEl = document.getElementById('ncsosImportStatus');
    const raw = textarea.value.trim();

    if (!raw) {
        showToast('Paste the NC SOS results page content first.', 'error');
        return;
    }

    const businesses = parseNCSOSText(raw);

    if (!businesses.length) {
        statusEl.textContent = '';
        showToast('Could not find any business names in the pasted text. Make sure you copied the results table.', 'error');
        return;
    }

    const prospects = getProspects();
    const leads = getLeads();
    const existingNames = new Set([
        ...prospects.map(p => p.name.toLowerCase().trim()),
        ...leads.map(l => (l.name || '').toLowerCase().trim()),
        ...leads.map(l => (l.business || '').toLowerCase().trim())
    ]);
    existingNames.delete('');

    let imported = 0;
    let skipped = 0;

    for (const biz of businesses) {
        const cleanName = biz.name.replace(/\b(LLC|INC|CORP|LTD|PLLC|LP|DBA)\b\.?/gi, '').replace(/\s+/g, ' ').trim();
        if (!cleanName || existingNames.has(cleanName.toLowerCase())) {
            skipped++;
            continue;
        }

        prospects.push({
            id: Date.now() + Math.floor(Math.random() * 10000),
            name: cleanName,
            contact: '',
            phone: '',
            email: '',
            address: '',
            website: '',
            category: categorizeNCSOSBusiness(cleanName),
            status: 'not-contacted',
            opportunity: 'Newly registered LLC in Mecklenburg County — likely needs signage and vehicle branding',
            notes: `[NC SOS Import ${new Date().toISOString().split('T')[0]}] ${biz.sosId ? 'SOS ID: ' + biz.sosId : ''} ${biz.date ? 'Filed: ' + biz.date : ''}`.trim(),
            date: new Date().toISOString()
        });

        existingNames.add(cleanName.toLowerCase());
        imported++;
    }

    saveProspectsData(prospects);
    renderProspects();

    textarea.value = '';
    statusEl.textContent = `Imported ${imported} businesses${skipped ? ` (${skipped} duplicates skipped)` : ''}`;
    showToast(`Imported ${imported} new NC SOS prospects!`, 'success');
}

function parseNCSOSText(text) {
    const businesses = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const skipPatterns = /^(SOS\s*ID|Name|Company|Entity|Type|Status|Date|County|Search|Page|Results|Showing|Previous|Next|Last|First|#|\d+\s*of\s*\d+|Home|Menu|search_business|Breadcrumb|Divisions|Programs|online_services|Business Registration|secretary.*state|footer|navigation|disclaimer|privacy|secure|\.gov|cookies|hours of|contact us|support|tutorial|alert|fees|FAQ|news|sign in|NC Gov|State Board|North Carolina|National Association|NASAA|Consular|Intellectual Property|All North|Data Subscription|Return to|skip to|just a moment|performing.*verification|cloudflare)/i;

    const sosIdPattern = /^\d{6,}/;
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    const statePattern = /^[A-Z]{2}$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (skipPatterns.test(line)) continue;
        if (datePattern.test(line)) continue;
        if (statePattern.test(line)) continue;
        if (sosIdPattern.test(line) && line.length <= 10) continue;
        if (line.length < 4 || line.length > 200) continue;

        // NC SOS table rows often have format: "SOS_ID | Name | Date | County"
        // or tab-separated values
        const tabParts = line.split(/\t+/);
        if (tabParts.length >= 2) {
            const namePart = tabParts.find(p => p.length > 3 && !/^\d+$/.test(p.trim()) && !datePattern.test(p.trim()) && !/^(Mecklenburg|Charlotte|NC|Limited|Business|Corporation|Active|Current|Admin|Dissolved)$/i.test(p.trim()));
            if (namePart) {
                businesses.push({
                    name: namePart.trim(),
                    sosId: tabParts[0]?.match(/^\d+/) ? tabParts[0].trim() : '',
                    date: tabParts.find(p => datePattern.test(p.trim()))?.trim() || ''
                });
                continue;
            }
        }

        // Pipe-separated (from copy-paste of tables)
        const pipeParts = line.split(/\s*\|\s*/);
        if (pipeParts.length >= 2) {
            const namePart = pipeParts.find(p => p.length > 3 && !/^\d+$/.test(p.trim()) && !datePattern.test(p.trim()));
            if (namePart) {
                businesses.push({
                    name: namePart.trim(),
                    sosId: pipeParts[0]?.match(/^\d+/) ? pipeParts[0].trim() : '',
                    date: pipeParts.find(p => datePattern.test(p.trim()))?.trim() || ''
                });
                continue;
            }
        }

        // Plain text — if it looks like a business name (contains letters, reasonable length)
        if (/[A-Za-z]/.test(line) && line.length >= 4 && line.length < 120) {
            const isLikelyName = /^[A-Z]/.test(line) || /LLC|INC|CORP|COMPANY|GROUP|SERVICES|SOLUTIONS|ENTERPRISES|HOLDINGS|CAPITAL|PROPERTIES|VENTURES|CONSULTING|STUDIO|DESIGNS?|MANAGEMENT|CONSTRUCTION|ELECTRIC|PLUMBING|HVAC|ROOFING|LANDSCAPING|AUTOMOTIVE|TRUCKING|MOVING|CLEANING|PAINTING|FLOORING|FENCING/i.test(line);

            if (isLikelyName) {
                businesses.push({ name: line, sosId: '', date: '' });
            }
        }
    }

    // Deduplicate by name
    const seen = new Set();
    return businesses.filter(b => {
        const key = b.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function categorizeNCSOSBusiness(name) {
    const lower = name.toLowerCase();
    if (/plumb|hvac|heat|cool|air|electric|roof|construct|paint|remodel|floor|fenc|weld|concrete|pav|excavat|demolit|build|install/i.test(lower)) return 'contractor';
    if (/landscap|lawn|tree|garden|mow/i.test(lower)) return 'landscaping';
    if (/restaurant|cater|food|pizza|grill|bbq|bakery|cafe|kitchen|taco|burger|brew|coffee|bar\b/i.test(lower)) return 'food';
    if (/auto|car|tow|truck|mechanic|tire|detail|body\s*shop|motor|vehicle/i.test(lower)) return 'auto';
    if (/real\s*estate|realty|property|homes|mortgage|title/i.test(lower)) return 'realestate';
    if (/clean|salon|fitness|dental|medical|spa|barber|beauty|gym|yoga|chiro|massage|pet|vet/i.test(lower)) return 'retail';
    return 'contractor';
}

// ==================== SCRAPER INTEGRATION ====================

let scrapedProspects = [];
const isLocalServer = window.location.protocol === 'http:' && window.location.hostname === 'localhost';

async function checkForScrapedLeads() {
    if (!isLocalServer) return;

    try {
        const res = await fetch('/api/scraper/status');
        const status = await res.json();

        if (status.newCount > 0) {
            const prospectsRes = await fetch('/api/prospects');
            scrapedProspects = await prospectsRes.json();
            const newOnes = scrapedProspects.filter(p => !p.imported);

            if (newOnes.length > 0) {
                const banner = document.getElementById('scraperBanner');
                banner.style.display = '';
                document.getElementById('scraperBannerCount').textContent =
                    `${newOnes.length} new prospect${newOnes.length === 1 ? '' : 's'}`;
                document.getElementById('scraperBannerTime').textContent =
                    `Last scrape: ${formatDate(status.lastRun)}`;
            }
        }
    } catch {
        // Not running on local server — that's fine, scraper features just won't be available
    }
}

async function runScraper() {
    if (!isLocalServer) {
        showToast('Start the local server first: run "npm run serve" in your terminal', 'error');
        return;
    }

    const btn = document.getElementById('runScraperBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Scraping...';
    showToast('Scraper started! This takes 1-2 minutes...', 'success');

    try {
        // Sync known names so the scraper skips businesses already in our dashboard
        const allProspects = getProspects();
        const allLeads = getLeads();
        const knownNames = [
            ...allProspects.map(p => p.name),
            ...allLeads.map(l => l.name),
            ...allLeads.map(l => l.business).filter(Boolean)
        ];
        await fetch('/api/prospects/known-names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: knownNames })
        }).catch(() => {});

        await fetch('/api/scraper/run', { method: 'POST' });

        // Poll for completion
        let checks = 0;
        const poll = setInterval(async () => {
            checks++;
            try {
                const res = await fetch('/api/scraper/status');
                const status = await res.json();

                if (checks > 1 && status.newCount > 0) {
                    clearInterval(poll);
                    btn.disabled = false;
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Run Scraper`;
                    showToast(`Scraper finished! Found ${status.newCount} new prospects.`, 'success');
                    checkForScrapedLeads();
                }

                if (checks >= 30) {
                    clearInterval(poll);
                    btn.disabled = false;
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Run Scraper`;
                    showToast('Scraper may still be running. Check back shortly.', '');
                    checkForScrapedLeads();
                }
            } catch {}
        }, 5000);

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Run Scraper`;
        showToast('Error starting scraper: ' + err.message, 'error');
    }
}

async function importAllScraped() {
    const newOnes = scrapedProspects.filter(p => !p.imported);
    if (!newOnes.length) return;

    const existing = getProspects();
    const leads = getLeads();

    // Check against both prospects AND CRM leads to catch all duplicates
    const existingNames = new Set([
        ...existing.map(p => p.name.toLowerCase().trim()),
        ...leads.map(l => (l.name || '').toLowerCase().trim()),
        ...leads.map(l => (l.business || '').toLowerCase().trim())
    ]);
    existingNames.delete('');

    let imported = 0;
    let skipped = 0;
    for (const p of newOnes) {
        if (!existingNames.has(p.name.toLowerCase().trim())) {
            existing.push({
                id: p.id,
                name: p.name,
                contact: p.contact || '',
                phone: p.phone || '',
                email: p.email || '',
                address: p.address || '',
                website: p.website || '',
                category: p.category || 'contractor',
                status: 'not-contacted',
                opportunity: p.opportunity || '',
                notes: p.notes || '',
                date: p.date
            });
            existingNames.add(p.name.toLowerCase().trim());
            imported++;
        } else {
            skipped++;
        }
    }

    saveProspectsData(existing);

    // Mark ALL as imported on server so they don't show up again
    try {
        await fetch('/api/prospects/mark-imported', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: newOnes.map(p => p.id) })
        });
    } catch {}

    document.getElementById('scraperBanner').style.display = 'none';
    renderProspects();
    const msg = skipped > 0
        ? `Imported ${imported} new prospects! (${skipped} duplicates skipped)`
        : `Imported ${imported} new prospects into your dashboard!`;
    showToast(msg, 'success');
}

function previewScraped() {
    const newOnes = scrapedProspects.filter(p => !p.imported);
    if (!newOnes.length) return;

    const catLabels = {
        contractor: 'Contractor', realestate: 'Real Estate', food: 'Food & Bev',
        landscaping: 'Landscaping', auto: 'Automotive', retail: 'Retail'
    };

    const html = newOnes.map(p => `
        <div class="prospect-row">
            <div>
                <strong>${esc(p.name)}</strong>
                <span class="sub">${esc(p.source || '')}</span>
            </div>
            <div>${catLabels[p.category] || p.category}</div>
            <div><span class="status-badge not-contacted">not contacted</span></div>
            <div class="sub">${esc((p.opportunity || '').substring(0, 60))}</div>
            <div></div>
        </div>
    `).join('');

    const container = document.getElementById('prospectList');
    container.innerHTML = `
        <div style="padding:12px 0 16px;display:flex;justify-content:space-between;align-items:center;">
            <strong style="color:var(--gray-800);">Scraped Prospects Preview (${newOnes.length})</strong>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-sm btn-primary" onclick="importAllScraped()">Import All</button>
                <button class="btn btn-sm btn-outline" onclick="renderProspects()">Back to My List</button>
            </div>
        </div>
        ${html}
    `;
}

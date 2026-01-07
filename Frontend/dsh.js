(() => {
  const $ = sel => document.querySelector(sel);
  const expenseForm = $('#expense-form');
  const descInput = $('#desc');
  const amountInput = $('#amount');
  const categoryInput = $('#category');
  const dateInput = $('#date');
  const tableBody = document.querySelector('#expenses-table tbody');
  const totalEl = $('#total');
  const byCategoryEl = $('#by-category');
  const clearBtn = $('#clear-btn');
  const exportBtn = $('#export-btn');
  const filterMonth = $('#filter-month');
  const filterCategory = $('#filter-category');
  const resetFilters = $('#reset-filters');

  const today = new Date().toISOString().slice(0,10);
  dateInput.value = today;
  async function loadExpenses(){
    try {
      const res = await fetch('/expenses');
      return await res.json();
    } catch(e){
      console.error('Failed to fetch expenses', e);
      return [];
    }
  }
  async function renderExpenses(){
    const all = await loadExpenses();
    const monthFilter = filterMonth.value;
    const categoryFilter = filterCategory.value;

    let filtered = all.slice();
    if(monthFilter) filtered = filtered.filter(e => e.date.slice(0,7) === monthFilter);
    if(categoryFilter) filtered = filtered.filter(e => e.category === categoryFilter);

    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

    tableBody.innerHTML = '';
    if(filtered.length === 0){
      tableBody.innerHTML = '<tr><td colspan="5" class="muted">No expenses yet</td></tr>';
    } else {
      filtered.forEach((e, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${e.date}</td>
          <td>${escapeHtml(e.description)}</td>
          <td>${escapeHtml(e.category)}</td>
          <td class="right">₹${Number(e.amount).toFixed(2)}</td>
          <td>
            <button class="small-btn delete" data-id="${idx}">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }
    const total = filtered.reduce((s,x)=>s+Number(x.amount),0);
    totalEl.textContent = `₹${total.toFixed(2)}`;
    const catTotals = {};
    filtered.forEach(x => catTotals[x.category] = (catTotals[x.category] || 0) + Number(x.amount));
    byCategoryEl.innerHTML = '';
    if(Object.keys(catTotals).length === 0) byCategoryEl.innerHTML = '<li class="muted">No data</li>';
    for(const k of Object.keys(catTotals)){
      const li = document.createElement('li');
      li.textContent = `${k}: ₹${catTotals[k].toFixed(2)}`;
      byCategoryEl.appendChild(li);
    }
  }
  async function addExpense(e){
    e.preventDefault();
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    if(!desc || !date || isNaN(amount) || amount <= 0){
      alert('Please enter valid description, date and a positive amount.');
      return;
    }
    try {
      const res = await fetch('/add-expense', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ description: desc, amount, category, date })
      });
      const data = await res.json();
      if(res.ok){
        expenseForm.reset();
        dateInput.value = today;
        renderExpenses();
      } else {
        alert(data.message);
      }
    } catch(err){
      console.error(err);
      alert('Failed to add expense');
    }
  }
  tableBody.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button.delete');
    if(!btn) return;
    const idx = btn.getAttribute('data-id');
    if(idx && confirm('Delete this expense?')) {
        try {
            await fetch(`/delete-expense/${idx}`, { method: 'DELETE' });
            renderExpenses();
        } catch(err){
            console.error(err);
            alert('Failed to delete expense');
        }
    }
  });
  clearBtn.addEventListener('click', async () => {
    if(confirm('Clear ALL expenses? This cannot be undone.')) {
        try {
            await fetch('/clear-expenses', { method: 'DELETE' });
            renderExpenses();
        } catch(err){
            console.error(err);
            alert('Failed to clear expenses');
        }
    }
  });
  exportBtn.addEventListener('click', async () => {
    const list = await loadExpenses();
    if(list.length === 0){ alert('No data to export'); return; }
    const header = ['Date','Description','Category','Amount'];
    const rows = list.map(r => [r.date, r.description.replace(/"/g,'""'), r.category, r.amount]);
    let csv = header.join(',') + '\n' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
  filterMonth.addEventListener('input', renderExpenses);
  filterCategory.addEventListener('change', renderExpenses);
  resetFilters.addEventListener('click', () => {
    filterMonth.value = '';
    filterCategory.value = '';
    renderExpenses();
  });
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  expenseForm.addEventListener('submit', addExpense);
  renderExpenses();
})();

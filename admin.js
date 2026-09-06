/* ==========================================================
   MediDent Clinic — Admin panel
   Lets the Admin account add/remove medicines (name + composition)
   and change the three account passwords.
   ========================================================== */

function renderCustomMedList() {
  const wrap = document.getElementById("customMedList");
  const meds = getCustomMeds();
  if (!meds.length) {
    wrap.innerHTML = `<p class="sub" style="margin:8px 0 0;">No medicines added yet. Use the form above to add one.</p>`;
    return;
  }
  wrap.innerHTML = `
    <table class="med-table" style="margin-top:10px;">
      <thead>
        <tr><th>Medicine</th><th>Composition</th><th>Category</th><th class="col-remove"></th></tr>
      </thead>
      <tbody>
        ${meds.map(m => `
          <tr data-med-name="${escapeHtml(m.name)}">
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.comp)}</td>
            <td>${escapeHtml(m.category || "Custom")}</td>
            <td class="col-remove"><button type="button" class="remove-row-btn admin-del-med" title="Remove">&times;</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  wrap.querySelectorAll(".admin-del-med").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const name = e.target.closest("tr").dataset.medName;
      if (confirm(`Remove "${name}" from the medicine list?`)) {
        deleteCustomMedicine(name);
        renderCustomMedList();
        showToast("Medicine removed.");
      }
    });
  });
}

function wireAdminPanel() {
  const form = document.getElementById("addMedicineForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newMedName").value.trim();
    const comp = document.getElementById("newMedComp").value.trim();
    const category = document.getElementById("newMedCategory").value.trim();
    if (!name) {
      showToast("Please enter a medicine name.");
      return;
    }
    addCustomMedicine(name, comp, category);
    form.reset();
    renderCustomMedList();
    showToast(`"${name}" added to the medicine list.`);
  });

  document.querySelectorAll(".admin-pw-form").forEach(pwForm => {
    pwForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = pwForm.dataset.username;
      const input = pwForm.querySelector("input[type=password]");
      const newPw = input.value;
      if (!newPw || newPw.length < 4) {
        showToast("Password should be at least 4 characters.");
        return;
      }
      changePassword(username, newPw);
      input.value = "";
      showToast(`Password updated for ${username}.`);
    });
  });

  renderCustomMedList();
}

document.addEventListener("DOMContentLoaded", wireAdminPanel);

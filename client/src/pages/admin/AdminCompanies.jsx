import { useState, useEffect } from "react";
import { getAdminCompanies, createCompany, updateCompany, deleteCompany, toggleCompanyStatus } from "../../services/adminDataService";
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Building2 } from "lucide-react";
import { calculateTimeLeft } from "../../utils/driveCountdown";
import "./AdminCompanies.css";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const initialFormState = {
    name: "",
    tier: "Mass Recruiter",
    benchmarks: { aptitude: 0, dsa: 0, communication: 0 },
    rolesOffered: [],
    testRoundsDescription: "",
    packageDetails: { minLPA: "", maxLPA: "" },
    employmentType: ["Full Time"],
    workMode: ["On-site"],
    isActive: true,
    upcomingDrive: {
      date: "",
      time: "",
      venue: "",
      mode: "Online",
    },
  };
  const [formData, setFormData] = useState(initialFormState);
  const [roleInput, setRoleInput] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchCompanies();
    
    // Page-level interval for countdown timers
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await getAdminCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (company) => {
    setEditingId(company._id);
    setFormData({
      name: company.name,
      tier: company.tier,
      benchmarks: { ...company.benchmarks },
      rolesOffered: [...company.rolesOffered],
      testRoundsDescription: company.testRoundsDescription || "",
      packageDetails: { 
        minLPA: company.packageDetails?.minLPA || "", 
        maxLPA: company.packageDetails?.maxLPA || "" 
      },
      employmentType: [...company.employmentType],
      workMode: [...company.workMode],
      isActive: company.isActive,
      upcomingDrive: {
        date: company.upcomingDrive?.date ? new Date(company.upcomingDrive.date).toISOString().split('T')[0] : "",
        time: company.upcomingDrive?.time || "",
        venue: company.upcomingDrive?.venue || "",
        mode: company.upcomingDrive?.mode || "Online",
      },
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleRoleKeyDown = (e) => {
    if (e.key === "Enter" && roleInput.trim()) {
      e.preventDefault();
      if (!formData.rolesOffered.includes(roleInput.trim())) {
        setFormData({
          ...formData,
          rolesOffered: [...formData.rolesOffered, roleInput.trim()],
        });
      }
      setRoleInput("");
    }
  };

  const removeRole = (roleToRemove) => {
    setFormData({
      ...formData,
      rolesOffered: formData.rolesOffered.filter(r => r !== roleToRemove)
    });
  };

  const handleCheckboxChange = (field, value) => {
    const currentArray = formData[field];
    if (currentArray.includes(value)) {
      setFormData({ ...formData, [field]: currentArray.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...currentArray, value] });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Company name is required";
    if (formData.benchmarks.aptitude < 0 || formData.benchmarks.aptitude > 100) return "Aptitude must be 0-100";
    if (formData.benchmarks.dsa < 0 || formData.benchmarks.dsa > 100) return "DSA must be 0-100";
    if (formData.benchmarks.communication < 0 || formData.benchmarks.communication > 100) return "Communication must be 0-100";
    
    if (formData.packageDetails.minLPA && formData.packageDetails.maxLPA) {
      if (Number(formData.packageDetails.minLPA) > Number(formData.packageDetails.maxLPA)) {
        return "Min LPA cannot be greater than Max LPA";
      }
    }
    
    if (formData.employmentType.length === 0) return "Select at least one employment type";
    if (formData.workMode.length === 0) return "Select at least one work mode";
    
    // Upcoming drive validation
    if (formData.upcomingDrive.date) {
      if (!formData.upcomingDrive.time) return "Drive time is required if date is set";
      if (!formData.upcomingDrive.mode) return "Drive mode is required if date is set";
      
      const driveDateTime = new Date(`${formData.upcomingDrive.date}T${formData.upcomingDrive.time}`);
      if (!editingId && driveDateTime < new Date()) {
        return "Upcoming drive cannot be in the past";
      }
    }
    
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateCompany(editingId, formData);
      } else {
        await createCompany(formData);
      }
      await fetchCompanies();
      setDrawerOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save company");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        await deleteCompany(id);
        await fetchCompanies();
      } catch (err) {
        alert("Failed to delete company");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCompanyStatus(id);
      await fetchCompanies();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  // Client-side filtering by name
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for countdown timer
  const formatCountdown = (driveDate, driveTime) => {
    const result = calculateTimeLeft(driveDate, driveTime);
    return result.completed ? "passed" : result.displayString;
  };

  return (
    <div className="admin-companies">
      <div className="companies-header">
        <div>
          <h2>Manage Companies</h2>
          <p>Add and configure companies for your students</p>
        </div>
        <button className="add-btn" onClick={openAddDrawer}>
          <Plus size={18} />
          Add Company
        </button>
      </div>

      <div className="companies-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search companies by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading companies...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} className="empty-icon" />
            <p>No companies found</p>
            {searchTerm ? (
              <button onClick={() => setSearchTerm("")}>Clear Search</button>
            ) : (
              <button onClick={openAddDrawer}>Add Your First Company</button>
            )}
          </div>
        ) : (
          <table className="companies-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Tier</th>
                <th>Benchmarks (A/D/C)</th>
                <th>Package</th>
                <th>Upcoming Drive</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company._id}>
                  <td>
                    <div className="company-name-cell">
                      <strong>{company.name}</strong>
                      <div className="company-tags">
                        {company.workMode.map(m => <span key={m} className="small-tag">{m}</span>)}
                      </div>
                    </div>
                  </td>
                  <td><span className={`tier-badge tier-${company.tier.replace(/\s+/g, '-').toLowerCase()}`}>{company.tier}</span></td>
                  <td>
                    <div className="benchmark-scores">
                      <span title="Aptitude">{company.benchmarks.aptitude}</span> / 
                      <span title="DSA">{company.benchmarks.dsa}</span> / 
                      <span title="Communication">{company.benchmarks.communication}</span>
                    </div>
                  </td>
                  <td>
                    {company.packageDetails.minLPA || company.packageDetails.maxLPA ? (
                      <span className="package-text">
                        {company.packageDetails.minLPA && company.packageDetails.maxLPA 
                          ? `${company.packageDetails.minLPA} - ${company.packageDetails.maxLPA} LPA`
                          : `${company.packageDetails.minLPA || company.packageDetails.maxLPA} LPA`}
                      </span>
                    ) : "-"}
                  </td>
                  <td>
                    {(() => {
                      if (!company.upcomingDrive || !company.upcomingDrive.date) {
                        return <span className="drive-label empty">No Drive Scheduled</span>;
                      }
                      
                      const countdown = formatCountdown(company.upcomingDrive.date, company.upcomingDrive.time);
                      const isPassed = countdown === "passed";
                      const dateObj = new Date(company.upcomingDrive.date);
                      const displayDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                      
                      if (isPassed) {
                        return (
                          <div className="drive-cell passed" title={company.upcomingDrive.venue || "No venue specified"}>
                            <span className="drive-label completed">Drive Completed</span>
                            <span className="drive-subtext">{displayDate}</span>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="drive-cell active" title={company.upcomingDrive.venue || "No venue specified"}>
                          <div className="drive-timer">{countdown}</div>
                          <div className="drive-subtext">{displayDate} at {company.upcomingDrive.time}</div>
                          <span className={`drive-badge mode-${company.upcomingDrive.mode.toLowerCase()}`}>
                            {company.upcomingDrive.mode}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={company.isActive} 
                        onChange={() => handleToggleStatus(company._id)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit-btn" onClick={() => openEditDrawer(company)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(company._id, company.name)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}></div>
          <div className="company-drawer">
            <div className="drawer-header-pane">
              <h3>{editingId ? "Edit Company" : "Add New Company"}</h3>
              <button className="close-btn" onClick={() => setDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="drawer-body">
              {formError && (
                <div className="drawer-error">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Company Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Google"
                />
              </div>

              <div className="form-group">
                <label>Tier *</label>
                <select 
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                >
                  <option value="Mass Recruiter">Mass Recruiter</option>
                  <option value="Mid Tier">Mid Tier</option>
                  <option value="Product Company">Product Company</option>
                  <option value="Startup">Startup</option>
                </select>
              </div>

              <div className="form-section">
                <h4>Required Benchmarks (0-100) *</h4>
                <div className="benchmark-grid">
                  <div className="form-group">
                    <label>Aptitude</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={formData.benchmarks.aptitude}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benchmarks: {...formData.benchmarks, aptitude: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>DSA</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={formData.benchmarks.dsa}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benchmarks: {...formData.benchmarks, dsa: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Communication</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={formData.benchmarks.communication}
                      onChange={(e) => setFormData({
                        ...formData, 
                        benchmarks: {...formData.benchmarks, communication: Number(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Package Details (LPA)</h4>
                <div className="package-grid">
                  <div className="form-group">
                    <label>Min LPA</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 6"
                      value={formData.packageDetails.minLPA}
                      onChange={(e) => setFormData({
                        ...formData, 
                        packageDetails: {...formData.packageDetails, minLPA: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max LPA</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      value={formData.packageDetails.maxLPA}
                      onChange={(e) => setFormData({
                        ...formData, 
                        packageDetails: {...formData.packageDetails, maxLPA: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Roles Offered</label>
                <input 
                  type="text" 
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={handleRoleKeyDown}
                  placeholder="Type role and press Enter"
                />
                <div className="tags-container">
                  {formData.rolesOffered.map(role => (
                    <span key={role} className="role-tag">
                      {role}
                      <button type="button" onClick={() => removeRole(role)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Test Rounds Description</label>
                <textarea 
                  rows="3"
                  value={formData.testRoundsDescription}
                  onChange={(e) => setFormData({...formData, testRoundsDescription: e.target.value})}
                  placeholder="e.g. Online aptitude → Technical → HR"
                ></textarea>
              </div>

              <div className="checkbox-groups">
                <div className="checkbox-group">
                  <label className="group-label">Employment Type *</label>
                  {["Full Time", "Part Time", "Internship"].map(type => (
                    <label key={type} className="checkbox-label">
                      <input 
                        type="checkbox"
                        checked={formData.employmentType.includes(type)}
                        onChange={() => handleCheckboxChange('employmentType', type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>

                <div className="checkbox-group">
                  <label className="group-label">Work Mode *</label>
                  {["On-site", "Remote", "Hybrid"].map(mode => (
                    <label key={mode} className="checkbox-label">
                      <input 
                        type="checkbox"
                        checked={formData.workMode.includes(mode)}
                        onChange={() => handleCheckboxChange('workMode', mode)}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group toggle-group">
                <label>Active Status</label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label">{formData.isActive ? "Active (visible to students)" : "Inactive (hidden)"}</span>
              </div>

              <div className="form-section">
                <h4>Upcoming Placement Drive (Optional)</h4>
                <div className="drive-grid">
                  <div className="form-group">
                    <label>Drive Date</label>
                    <input 
                      type="date" 
                      value={formData.upcomingDrive.date}
                      onChange={(e) => setFormData({
                        ...formData, 
                        upcomingDrive: {...formData.upcomingDrive, date: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Drive Time</label>
                    <input 
                      type="time" 
                      value={formData.upcomingDrive.time}
                      onChange={(e) => setFormData({
                        ...formData, 
                        upcomingDrive: {...formData.upcomingDrive, time: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mode</label>
                    <select 
                      value={formData.upcomingDrive.mode}
                      onChange={(e) => setFormData({
                        ...formData, 
                        upcomingDrive: {...formData.upcomingDrive, mode: e.target.value}
                      })}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Venue / Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Main Auditorium, Block A"
                    value={formData.upcomingDrive.venue}
                    onChange={(e) => setFormData({
                      ...formData, 
                      upcomingDrive: {...formData.upcomingDrive, venue: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="cancel-btn" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : editingId ? "Update Company" : "Add Company"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCompanies;

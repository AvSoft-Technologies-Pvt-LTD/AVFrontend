import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Clock, Home, Star, CheckCircle2 } from "lucide-react";
import { hydrateCart } from "../../../../../context-api/cartSlice";
import { initializeAuth } from "../../../../../context-api/authSlice";
import TableHeader from "../../../../../components/microcomponents/TableComponents/TableHeader";
import { getAvailableLabsBySelection, getAllAvailableLabs } from "../../../../../utils/masterService";

const AvailableLab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { dispatch(initializeAuth()); }, [dispatch]);

  const patientIdFromStore = useSelector(
    (state) => state.auth?.user?.patientId ?? state.auth?.patientId ?? null
  );
  const patientId = patientIdFromStore == null ? null : Number(patientIdFromStore);

  const cart = useSelector((state) => state.cart);

  // If arriving directly or cart not passed via location, ensure cart is hydrated from API
  useEffect(() => {
    const ensureCart = async () => {
      try {
        if (Array.isArray(cart) && cart.length > 0) return;

        // If cart came via navigation state, hydrate from that first
        const navCart = location?.state?.cart;
        if (Array.isArray(navCart) && navCart.length > 0) {
          dispatch(hydrateCart(navCart));
          return;
        }

        const { data } = await getAllAvailableLabs();
        const rows = Array.isArray(data) ? data : (data?.availableLabs || []);

        const normTests = rows
          .filter((r) => r?.testId != null)
          .map((r) => ({
            ...r,
            id: r.testId,
            kind: "test",
            title: r.testName ?? r.name ?? r.code ?? "Test",
            price: Number(r.price) || 0,
            quantity: 1,
          }));
        const normScans = rows
          .filter((r) => r?.scanId != null)
          .map((r) => ({
            ...r,
            id: r.scanId,
            kind: "scan",
            title: r.scanName ?? r.name ?? r.code ?? "Scan",
            price: Number(r.price) || 0,
            quantity: 1,
          }));
        const normPackages = rows
          .filter((r) => r?.packageId != null)
          .map((r) => ({
            ...r,
            id: r.packageId,
            kind: "package",
            title: r.packageName ?? r.name ?? "Package",
            price: Number(r.price) || 0,
            quantity: 1,
          }));

        dispatch(hydrateCart([...normTests, ...normScans, ...normPackages]));
      } catch (error) {
        console.error("Error hydrating cart:", error?.response?.data || error.message);
      }
    };
    ensureCart();
  }, [dispatch, patientId]);

  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState("");

  const [search, setSearch] = useState("");

  // Filters (desktop + mobile)
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isDesktopFiltersExpanded, setIsDesktopFiltersExpanded] = useState(false);
  const filterRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState({
    location: [],         // string[]
    homeCollection: [],   // ["yes"] or ["no"]
    rating: [],           // ["4.5","4.0",...]
    reportTime: [],       // ["12 Hours",...]
  });

  const selectedItems = useMemo(() => cart || [], [cart]);
  const selectedTestNames = useMemo(
    () => (selectedItems || [])
      .filter((x) => x?.kind === "test")
      .map((x) => String(x.title ?? x.testName ?? x.name ?? x.code))
      .filter(Boolean),
    [selectedItems]
  );
  const selectedScanNames = useMemo(
    () => (selectedItems || [])
      .filter((x) => x?.kind === "scan")
      .map((x) => String(x.title ?? x.scanName ?? x.name ?? x.code))
      .filter(Boolean),
    [selectedItems]
  );
  const selectedPackageNames = useMemo(
    () => (selectedItems || [])
      .filter((x) => x?.kind === "package")
      .map((x) => String(x.title ?? x.packageName ?? x.name))
      .filter(Boolean),
    [selectedItems]
  );
  const total = useMemo(
    () => selectedItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1), 0),
    [selectedItems]
  );

  const allLocations = useMemo(
    () => Array.from(new Set(labs.map((l) => l.location))).sort(),
    [labs]
  );
  const ratingOptions = ["4.5", "4.0", "3.5", "3.0"];
  const reportTimeOptions = Array.from(new Set(labs.map((l) => l.reportTime)));

  // Fetch labs from API when cart selections change or when searching by location
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLabsError("");
        setLabsLoading(true);

        // If user typed anything, load ALL availabilities, then filter client-side
        const q = (search || "").trim();
        if (q.length > 0) {
          const { data } = await getAllAvailableLabs();
          if (cancelled) return;
          const rows = Array.isArray(data) ? data : (data?.availableLabs || []);
          const grouped = new Map();
          for (const row of rows) {
            const key = row.labAvailableId || row.labId || row.id || `${row.labName || "lab"}-${row.location || ""}`;
            const newPrice = Number((row.totalPrice ?? row.price)) || 0;
            if (!grouped.has(key)) {
              grouped.set(key, {
                id: key,
                labAvailableId: row.labAvailableId || row.labId || row.id || key,
                labName: row.labName || "",
                location: row.location || "",
                rating: Number(row.rating) || 0,
                price: newPrice,
                reportTime: row.reportTime || "",
                testName: row.testName || "",
                scanName: row.scanName || "",
                packageName: row.packageName || "",
                homeCollection: row.homeCollection === true || row.homeCollection === "true" || row.homeCollection === "YES",
              });
            } else {
              const current = grouped.get(key);
              if ((current.price === 0 && newPrice > 0) || (newPrice > 0 && newPrice < current.price)) {
                current.price = newPrice;
                grouped.set(key, current);
              }
            }
          }
          const normalized = Array.from(grouped.values());
          setLabs(normalized);
          return;
        }

        // Otherwise pull availability based on selected tests/scans
        // If nothing is selected and no search, fall back to get-all API
        if ((selectedTestNames?.length || 0) === 0 && (selectedScanNames?.length || 0) === 0 && (selectedPackageNames?.length || 0) === 0) {
          const { data } = await getAllAvailableLabs();
          if (cancelled) return;
          const rows = Array.isArray(data) ? data : (data?.availableLabs || []);
          const grouped = new Map();
          for (const row of rows) {
            const key = row.labAvailableId || row.labId || row.id || `${row.labName || "lab"}-${row.location || ""}`;
            const newPrice = Number((row.totalPrice ?? row.price)) || 0;
            if (!grouped.has(key)) {
              grouped.set(key, {
                id: key,
                labAvailableId: row.labAvailableId || row.labId || row.id || key,
                labName: row.labName || "",
                location: row.location || "",
                rating: Number(row.rating) || 0,
                price: newPrice,
                reportTime: row.reportTime || "",
                testName: row.testName || "",
                scanName: row.scanName || "",
                packageName: row.packageName || "",
                homeCollection: row.homeCollection === true || row.homeCollection === "true" || row.homeCollection === "YES",
              });
            } else {
              const current = grouped.get(key);
              if ((current.price === 0 && newPrice > 0) || (newPrice > 0 && newPrice < current.price)) {
                current.price = newPrice;
                grouped.set(key, current);
              }
            }
          }
          const normalized = Array.from(grouped.values());
          setLabs(normalized);
          return;
        }
        const { data } = await getAvailableLabsBySelection({
          selectedTests: selectedTestNames,
          selectedScans: selectedScanNames,
          selectedPackages: selectedPackageNames,
        });
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : (data?.availableLabs || []);
        const grouped = new Map();
        for (const row of rows) {
          const key = row.labAvailableId || row.labId || row.id || `${row.labName || "lab"}-${row.location || ""}`;
          const newPrice = Number((row.totalPrice ?? row.price)) || 0;
          if (!grouped.has(key)) {
            grouped.set(key, {
              id: key,
              labAvailableId: row.labAvailableId || row.labId || row.id || key,
              labName: row.labName || "",
              location: row.location || "",
              rating: Number(row.rating) || 0,
              price: newPrice,
              reportTime: row.reportTime || "",
              testName: row.testName || "",
              scanName: row.scanName || "",
              packageName: row.packageName || "",
              homeCollection: row.homeCollection === true || row.homeCollection === "true" || row.homeCollection === "YES",
            });
          } else {
            const current = grouped.get(key);
            if ((current.price === 0 && newPrice > 0) || (newPrice > 0 && newPrice < current.price)) {
              current.price = newPrice;
              grouped.set(key, current);
            }
          }
        }
        const normalized = Array.from(grouped.values());
        setLabs(normalized);
      } catch (e) {
        setLabsError(e?.message || "Failed to load labs");
      } finally {
        setLabsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [search, selectedTestNames, selectedScanNames, selectedPackageNames]);

  const applyFilters = (items) => {
    let out = items;
    if (search.trim().length > 0) {
      const s = search.toLowerCase();
      out = out.filter((lab) =>
        (lab.labName || "").toLowerCase().includes(s) || (lab.location || "").toLowerCase().includes(s)
      );
    }

    if (activeFilters.location.length > 0) {
      out = out.filter((lab) => activeFilters.location.includes(lab.location));
    }
    if (activeFilters.homeCollection.length > 0) {
      out = out.filter((lab) => {
        const wantYes = activeFilters.homeCollection.includes("yes");
        const wantNo = activeFilters.homeCollection.includes("no");
        return (wantYes && lab.homeCollection) || (wantNo && !lab.homeCollection);
      });
    }
    if (activeFilters.rating.length > 0) {
      out = out.filter((lab) =>
        activeFilters.rating.some((min) => Number(lab.rating) >= Number(min))
      );
    }
    if (activeFilters.reportTime.length > 0) {
      out = out.filter((lab) => activeFilters.reportTime.includes(lab.reportTime));
    }
    return out;
  };

  const filteredLabs = applyFilters(labs);

  const getActiveFilterCount = () =>
    Object.values(activeFilters).reduce((c, arr) => c + (arr?.length || 0), 0);

  const handleFilterChange = (key, newValues) => {
    setActiveFilters((prev) => ({ ...prev, [key]: newValues }));
  };

  const handleDesktopFilterToggle = () => {
    setIsDesktopFiltersExpanded((v) => !v);
  };

  const openFilter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches) {
      // xl and above: open inline desktop panel
      setIsDesktopFiltersExpanded(true);
    } else {
      // mobile/tablet: open full-screen modal
      setShowFilterPopup(true);
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (isDesktopFiltersExpanded && filterRef.current && !filterRef.current.contains(e.target)) {
        setIsDesktopFiltersExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDesktopFiltersExpanded]);

  const handleSelectLab = (lab) => {
    const selectedId = lab?.labAvailableId || lab?.id || `${lab.labName || 'lab'}-${lab.location || ''}`;
    if (!selectedId) {
      console.error('Selected lab is missing labAvailableId and id:', lab);
      return;
    }
    const payload = { ...lab, labAvailableId: selectedId };
    navigate(`/patientdashboard/lab-booking`, { state: { lab: payload, cart: selectedItems } });
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 sm:px-10 py-8 space-y-4">
      {/* ✅ Selected Tests Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            Selected Tests
          </h2>
          <span className="text-gray-800 font-semibold">
            Total: <span className="text-[var(--primary-color)]">₹{total}</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {selectedItems.map((test, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-800 leading-tight">{test.title}</p>
              {test.code && <p className="text-sm text-gray-500 mt-1">Code: {test.code}</p>}
              <p className="text-[var(--primary-color)] font-semibold mt-2">₹{Number(test.price) || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Search Section */}
      <TableHeader
        title="Available Labs"
        tabs={[]}
        activeTab={""}
        onTabChange={() => {}}
        tabActions={[]}
        searchQuery={search}
        setSearchQuery={setSearch}
        filters={[{ key: "labs", label: "Filters" }]}
        setFilterPanelOpen={openFilter}
      />

      {/* Desktop filter panel */}
      {isDesktopFiltersExpanded && (
        <div className="relative" ref={filterRef}>
          <div className="absolute z-20 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Location</h3>
                <div className="space-y-2 max-h-40 overflow-auto pr-1">
                  {allLocations.map((loc) => {
                    const selected = activeFilters.location.includes(loc);
                    return (
                      <label key={loc} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary-color)]"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? activeFilters.location.filter((l) => l !== loc)
                              : [...activeFilters.location, loc];
                            handleFilterChange("location", next);
                          }}
                        />
                        <span className="text-sm">{loc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Home collection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Home Collection</h3>
                {[
                  { v: "yes", label: "Available" },
                  { v: "no", label: "Not Available" },
                ].map((opt) => {
                  const selected = activeFilters.homeCollection.includes(opt.v);
                  return (
                    <label key={opt.v} className="flex items-center gap-2 block">
                      <input
                        type="checkbox"
                        className="accent-[var(--primary-color)]"
                        checked={selected}
                        onChange={() => {
                          const next = selected
                            ? activeFilters.homeCollection.filter((x) => x !== opt.v)
                            : [...activeFilters.homeCollection, opt.v];
                          handleFilterChange("homeCollection", next);
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Minimum Rating</h3>
                {ratingOptions.map((r) => {
                  const selected = activeFilters.rating.includes(r);
                  return (
                    <label key={r} className="flex items-center gap-2 block">
                      <input
                        type="checkbox"
                        className="accent-[var(--primary-color)]"
                        checked={selected}
                        onChange={() => {
                          const next = selected
                            ? activeFilters.rating.filter((x) => x !== r)
                            : [...activeFilters.rating, r];
                          handleFilterChange("rating", next);
                        }}
                      />
                      <span className="text-sm">{r}+</span>
                    </label>
                  );
                })}
              </div>

              {/* Report Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Report Time</h3>
                {reportTimeOptions.map((rt) => {
                  const selected = activeFilters.reportTime.includes(rt);
                  return (
                    <label key={rt} className="flex items-center gap-2 block">
                      <input
                        type="checkbox"
                        className="accent-[var(--primary-color)]"
                        checked={selected}
                        onChange={() => {
                          const next = selected
                            ? activeFilters.reportTime.filter((x) => x !== rt)
                            : [...activeFilters.reportTime, rt];
                          handleFilterChange("reportTime", next);
                        }}
                      />
                      <span className="text-sm">{rt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setActiveFilters({ location: [], homeCollection: [], rating: [], reportTime: [] })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setIsDesktopFiltersExpanded(false)}
                className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90"
              >
                Apply Filters
              </button>
          </div>
          <div className="p-4 border-t">
            <button
              onClick={() => setShowFilterPopup(false)}
              className="w-full py-3 rounded-lg bg-[var(--primary-color)] text-white font-semibold hover:opacity-90"
            >
              APPLY FILTERS
            </button>
          </div>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Filter Labs</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFilters({ location: [], homeCollection: [], rating: [], reportTime: [] })}
                  className="text-sm text-gray-600"
                >
                  Reset
                </button>
                <button onClick={() => setShowFilterPopup(false)} className="text-sm text-gray-600">Close</button>
              </div>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Location */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Location</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allLocations.map((loc) => {
                    const selected = activeFilters.location.includes(loc);
                    return (
                      <label key={loc} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary-color)]"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? activeFilters.location.filter((l) => l !== loc)
                              : [...activeFilters.location, loc];
                            handleFilterChange("location", next);
                          }}
                        />
                        <span className="text-sm">{loc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Home Collection */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Home Collection</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "yes", label: "Available" },
                    { v: "no", label: "Not Available" },
                  ].map((opt) => {
                    const selected = activeFilters.homeCollection.includes(opt.v);
                    return (
                      <label key={opt.v} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary-color)]"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? activeFilters.homeCollection.filter((x) => x !== opt.v)
                              : [...activeFilters.homeCollection, opt.v];
                            handleFilterChange("homeCollection", next);
                          }}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Minimum Rating</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ratingOptions.map((r) => {
                    const selected = activeFilters.rating.includes(r);
                    return (
                      <label key={r} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary-color)]"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? activeFilters.rating.filter((x) => x !== r)
                              : [...activeFilters.rating, r];
                            handleFilterChange("rating", next);
                          }}
                        />
                        <span className="text-sm">{r}+</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Report Time */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Report Time</h4>
                <div className="grid grid-cols-2 gap-2">
                  {reportTimeOptions.map((rt) => {
                    const selected = activeFilters.reportTime.includes(rt);
                    return (
                      <label key={rt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--primary-color)]"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? activeFilters.reportTime.filter((x) => x !== rt)
                              : [...activeFilters.reportTime, rt];
                            handleFilterChange("reportTime", next);
                          }}
                        />
                        <span className="text-sm">{rt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowFilterPopup(false)}
                className="w-full py-3 rounded-lg bg-[var(--primary-color)] text-white font-semibold hover:opacity-90"
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Labs</h2>
          <span className="text-sm text-gray-600">{filteredLabs.length} results</span>
        </div>

        {labsLoading && (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        )}
        {!labsLoading && labsError && (
          <div className="py-8 text-center text-red-600">{labsError}</div>
        )}
        {!labsLoading && !labsError && filteredLabs.length === 0 && (
          <div className="py-8 text-center text-gray-600">No labs found</div>
        )}

        {!labsLoading && !labsError && filteredLabs.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {filteredLabs.map((lab, idx) => (
              <div key={`${lab.labAvailableId || lab.id || `${lab.labName}-${lab.location}`}-${idx}`}
                   className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{lab.labName}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{lab.location || "-"}</span>
                    </div>
                    {(lab.testName || lab.scanName || lab.packageName) && (
                      <div className="mt-1 text-sm text-gray-700">
                        {lab.testName || lab.scanName || lab.packageName}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{lab.reportTime ? new Date(lab.reportTime).toLocaleString() : "-"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4" />
                      <span>{lab.homeCollection ? "Home collection available" : "No home collection"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-yellow-500">
                      <Star className="w-4 h-4" />
                      <span className="text-sm text-gray-800">{Number(lab.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="mt-2 text-[var(--primary-color)] font-semibold">₹{lab.price || 0}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectLab(lab)}
                  className="mt-auto w-full py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90"
                >
                  Select Lab
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableLab;

"use client";

import React, { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";

export function TransactionTable({
  pageSize = 20,
  initialStartDate = "",
  initialEndDate = "",
}) {
  const {
    transactions,
    currentPage,
    totalPages,
    totalCount,
    loading,
    error,
    goNext,
    goPrev,
    goToPage,
    setDateRange,
    startDate,
    endDate,
  } = useTransactions({
    pageSize,
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);

  
  // useEffect(() => {
   
  // }, [
  //   currentPage,
  //   totalPages,
  //   totalCount,
  //   loading,
  //   error,
  //   startDate,
  //   endDate,
  //   draftStartDate,
  //   draftEndDate,
  //   transactions,
  // ]);

 

  const renderBody = () => {
    
    if (loading) {
      return (
        <tr>
          <td colSpan={5} style={{ textAlign: "center" }}>
            Loading...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={5} style={{ color: "red", textAlign: "center" }}>
            {error}
          </td>
        </tr>
      );
    }
    if (!transactions.length) {
      return (
        <tr>
          <td colSpan={5} style={{ textAlign: "center" }}>
            No transactions found
          </td>
        </tr>
      );
    }
    const baseIndex = (currentPage - 1) * pageSize;
    return transactions.map((t, idx) => {
      let dateValue = t.date;
      try {
        if (dateValue) {
          const d = new Date(dateValue);
          if (!isNaN(d.getTime())) {
            dateValue = d.toLocaleDateString();
          }
        }
      } catch {
       
      }
      if (idx < 5) {
       
      }
      return (
        <tr key={t._id || idx}>
          <td>{baseIndex + idx + 1}</td>
          <td>{dateValue || "-"}</td>
          <td>{t.amount != null ? t.amount : "-"}</td>
          <td>{t.category || "-"}</td>
          <td>{t.description || "-"}</td>
        </tr>
      );
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <form
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (draftStartDate && draftEndDate && draftStartDate > draftEndDate) {
            console.warn("[ApplyFilters] invalid range", {
              draftStartDate,
              draftEndDate,
            });
            alert("Start date cannot be after end date");
            return;
          }
          setDateRange(draftStartDate, draftEndDate);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={draftStartDate}
            onChange={(e) => {
              setDraftStartDate(e.target.value);
              console.log("[Draft startDate changed]", e.target.value);
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={draftEndDate}
            onChange={(e) => {
              setDraftEndDate(e.target.value);
              console.log("[Draft endDate changed]", e.target.value);
            }}
          />
        </div>
        <button type="submit" disabled={loading}>
          Apply Filters
        </button>
        <button
          type="button"
          onClick={() => {
            console.log("[ClearDates clicked]");
            setDraftStartDate("");
            setDraftEndDate("");
            setDateRange("", "");
          }}
          disabled={loading && !error}
        >
          Clear Dates
        </button>
        <small style={{ opacity: 0.7 }}>
          (Apply to fetch. Prevents API calls while typing.)
        </small>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "650px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}></th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            // console.log("[Pagination] Prev clicked");
            goPrev();
          }}
          disabled={currentPage <= 1 || loading}
        >
          Prev
        </button>
        <span>
          Page {currentPage} / {totalPages} ({totalCount} total)
        </span>
        <button
          onClick={() => {
            // console.log("[Pagination] Next clicked");
            goNext();
          }}
          disabled={currentPage >= totalPages || loading}
        >
          Next
        </button>
        <label style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          Go to:
          <input
            type="number"
            min={1}
            max={totalPages}
            style={{ width: "4rem" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = parseInt(e.currentTarget.value, 10);
                console.log("[Pagination] GoTo attempt", val);
                if (!isNaN(val)) goToPage(val);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "0.5rem",
};

export default TransactionTable;

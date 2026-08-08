package com.parkpulse.dto;

public class ReportStatsDTO {
    private int total;
    private int ready;
    private int generating;
    private int failed;
    private long totalSizeKb;

    public ReportStatsDTO() {}

    public ReportStatsDTO(int total, int ready, int generating, int failed, long totalSizeKb) {
        this.total = total;
        this.ready = ready;
        this.generating = generating;
        this.failed = failed;
        this.totalSizeKb = totalSizeKb;
    }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getReady() { return ready; }
    public void setReady(int ready) { this.ready = ready; }
    public int getGenerating() { return generating; }
    public void setGenerating(int generating) { this.generating = generating; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
    public long getTotalSizeKb() { return totalSizeKb; }
    public void setTotalSizeKb(long totalSizeKb) { this.totalSizeKb = totalSizeKb; }
}

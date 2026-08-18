import { describe, expect, it } from "vitest";
import { calculateMetrics } from "../lib/metrics";

const a=(code:string,value:number|null,notApplicable=false)=>({code,value,notApplicable});
describe("calculateMetrics",()=>{
  it("calculates CSAT and NPS with required rounding",()=>{const m=calculateMetrics([[a("OVERALL_SATISFACTION",5),a("NPS",10)],[a("OVERALL_SATISFACTION",4),a("NPS",9)],[a("OVERALL_SATISFACTION",3),a("NPS",6)]]);expect(m.csat).toBe(66.7);expect(m.nps).toBe(33)});
  it("calculates quality only when both values exist",()=>{const m=calculateMetrics([[a("EXPECTATIONS_MATCH",4),a("PRACTICAL_VALUE",5)],[a("EXPECTATIONS_MATCH",1)]]);expect(m.qualityIndex).toBe(4.5)});
  it("requires three collaboration answers per response",()=>{const m=calculateMetrics([[a("COLLABORATION_UNDERSTANDING",5),a("COLLABORATION_PROFESSIONALISM",4)],[a("COLLABORATION_UNDERSTANDING",4),a("COLLABORATION_PROFESSIONALISM",4),a("COLLABORATION_COMMUNICATION",5)]]);expect(m.collaborationIndex).toBe(4.33)});
  it("excludes not applicable instead of treating it as zero",()=>{const m=calculateMetrics([[a("OVERALL_SATISFACTION",null,true)],[a("OVERALL_SATISFACTION",5)]]);expect(m.csat).toBe(100);expect(m.averageOverall).toBe(5)});
  it("returns null metrics for an empty sample",()=>{const m=calculateMetrics([]);expect(m.csat).toBeNull();expect(m.nps).toBeNull();expect(m.qualityIndex).toBeNull()});
  it("calculates negative share from valid 1–5 answers",()=>{const m=calculateMetrics([[a("OVERALL_SATISFACTION",1),a("EXPECTATIONS_MATCH",2),a("PRACTICAL_VALUE",5),a("NPS",0)]]);expect(m.negativeShare).toBe(66.7)});
});

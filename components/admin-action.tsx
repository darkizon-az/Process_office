"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminAction({url,label,variant="secondary",prompt}:{url:string;label:string;variant?:"secondary"|"danger";prompt?:string}){const router=useRouter();const [loading,setLoading]=useState(false);async function run(){const reason=prompt?window.prompt(prompt):undefined;if(prompt&&(!reason||!reason.trim()))return;setLoading(true);const res=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(reason?{reason}: {})});if(!res.ok){const b=await res.json().catch(()=>({}));alert(b.error||"Действие не выполнено")}router.refresh();setLoading(false)}return <button className={`button ${variant}`} onClick={run} disabled={loading}>{loading?"…":label}</button>}

import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage(){ if(await getAdmin()) redirect("/admin"); return <main className="login-page"><section className="login-art"><div className="brand"><span className="brandmark">PO</span> Process Office</div><div><p style={{opacity:.78,fontWeight:700}}>ЕДИНАЯ СИСТЕМА ОБРАТНОЙ СВЯЗИ</p><h1>Решения становятся лучше, когда мы слышим друг друга.</h1></div><p style={{opacity:.7}}>Аналитика взаимодействия с процессным офисом</p></section><section className="login-form-wrap"><div className="login-card"><div className="eyebrow">Административная панель</div><h2>Добро пожаловать</h2><p className="muted">Войдите, чтобы работать с опросами и аналитикой.</p><LoginForm/></div></section></main>}

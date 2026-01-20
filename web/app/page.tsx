"use client";

import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

export default function Home() {
  const [status, setStatus] = useState("检查登录状态中...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // 读取当前用户
  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error && error.name !== "AuthSessionMissingError") {
      setStatus("Supabase 错误：" + error.message);
      return;
    }

    if (data.user) setStatus("已登录用户：" + (data.user.email ?? "(无邮箱)"));
    else setStatus("Supabase 连接成功 ✅ 当前未登录");
  };

  useEffect(() => {
    refreshUser();

    // 监听登录状态变化（登录/退出后自动刷新状态）
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async () => {
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg("注册失败：" + error.message);
    else setMsg("注册成功 ✅（如果开启邮箱验证，请去邮箱确认）");
  };

  const signIn = async () => {
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg("登录失败：" + error.message);
    else setMsg("登录成功 ✅");
  };

  const signOut = async () => {
    setMsg("");
    const { error } = await supabase.auth.signOut();
    if (error) setMsg("退出失败：" + error.message);
    else setMsg("已退出登录");
  };
const createCompanies = async () => {
  setMsg("");
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return setMsg("请先登录");

  const now = new Date();
  const start = now.toISOString();
  /*const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString();*/

  const { error } = await supabase.from("companies").insert({
    //user_id: user.id,
    name: "test Company",
    create_at: start,
  });

  if (error) setMsg("创建公司失败：" + error.message);
  else {
    setMsg("创建公司成功 ✅");
    fetchCompanies();
  }
};
const [companies, setCompanies] = useState<any[]>([]);

const fetchCompanies = async () => {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("create_at", { ascending: true });

  if (!error) setCompanies(data ?? []);
};
  return (
    <main style={{ padding: 24, maxWidth: 480 }}>
      <h1>Pureeco</h1>

      <p style={{ marginTop: 8 }}>{status}</p >

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          placeholder="Password（至少 6 位）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={signUp} style={{ padding: "10px 14px", borderRadius: 8 }}>
            注册
          </button>
          <button onClick={signIn} style={{ padding: "10px 14px", borderRadius: 8 }}>
            登录
          </button>
          <button onClick={signOut} style={{ padding: "10px 14px", borderRadius: 8 }}>
            退出
          </button>
        </div>
<button onClick={createCompanies}>新增测试项</button>
<ul>
  {companies.map((b)=>(
    <li key={b.id}>
      {b.id}|{b.name}
    </li>
  ))}
</ul>
        {msg && <p>{msg}</p >}
      </div>
    </main>
  );
}

import { useState } from "react";
import API from "../../api/axios";

export default function CreateUser() {
  const [form, setForm] = useState({});

  const createUser = async () => {
    await API.post("create-user/", form);
    alert("User created ✅");
  };

  return (
    <div>
      <h2>Create User</h2>

      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={createUser}>Create</button>
    </div>
  );
}

import { DEV_FIXTURES } from "../lib/devFixtures";

// Renders inline JS injected into the Swagger UI page (via swagger-ui-express's
// `customJsStr` option) that adds three "log in as ..." buttons. Each one
// signs in through the real auth endpoints, then calls the Swagger UI
// instance's own `preauthorizeApiKey` — the same action the "Authorize"
// dialog dispatches on submit — so every "Try it out" call is authenticated
// with no manual token copy-paste. Dev-only: the caller must not wire this
// up in production.
export function buildSwaggerDevAuthScript(): string {
  return `
(function () {
  function authorize(token) {
    if (window.ui && window.ui.preauthorizeApiKey) {
      window.ui.preauthorizeApiKey("bearerAuth", token);
    }
  }

  async function postJson(path, body) {
    var res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    var data = await res.json().catch(function () { return {}; });
    return { status: res.status, data: data };
  }

  async function loginCustomer() {
    var phone = ${JSON.stringify(DEV_FIXTURES.customerPhone)};
    var requested = await postJson("/api/auth/otp/request", { phone: phone });
    if (requested.status !== 200 || !requested.data.devCode) {
      throw new Error("OTP request failed — is the backend running with NODE_ENV != production?");
    }
    var verified = await postJson("/api/auth/otp/verify", { phone: phone, code: requested.data.devCode });
    if (verified.status !== 200) throw new Error("OTP verify failed");
    return verified.data.token;
  }

  async function loginOwner() {
    var email = ${JSON.stringify(DEV_FIXTURES.owner.email)};
    var password = ${JSON.stringify(DEV_FIXTURES.owner.password)};
    var login = await postJson("/api/auth/login", { email: email, password: password });
    if (login.status !== 200) {
      throw new Error("Owner login failed — run: npm run prisma:seed --workspace backend");
    }
    return login.data.token;
  }

  async function loginAdmin() {
    var email = ${JSON.stringify(DEV_FIXTURES.admin.email)};
    var password = ${JSON.stringify(DEV_FIXTURES.admin.password)};
    var login = await postJson("/api/auth/login", { email: email, password: password });
    if (login.status !== 200) {
      throw new Error("Admin login failed — run: npm run prisma:seed --workspace backend");
    }
    return login.data.token;
  }

  function addButton(bar, label, handler) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.style.cssText =
      "margin:0 8px 8px 0;padding:6px 14px;border-radius:6px;border:1px solid #61affe;" +
      "background:#fff;color:#3b4151;font-weight:700;cursor:pointer;font-size:13px";
    btn.onclick = function () {
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "…";
      handler()
        .then(function (token) {
          authorize(token);
          btn.textContent = "✓ " + original;
        })
        .catch(function (err) {
          btn.textContent = "✗ " + original;
          console.error(err);
          window.alert((err && err.message) || String(err));
        })
        .finally(function () {
          setTimeout(function () {
            btn.textContent = original;
            btn.disabled = false;
          }, 2000);
        });
    };
    bar.appendChild(btn);
  }

  function init() {
    var bar = document.createElement("div");
    bar.style.cssText = "padding:12px 20px;background:#fafafa;border-bottom:1px solid #e8e8e8";

    var label = document.createElement("span");
    label.textContent = "Dev quick-login:";
    label.style.cssText = "margin-right:10px;font-weight:700;color:#3b4151;font-size:13px";
    bar.appendChild(label);

    addButton(bar, "Customer", loginCustomer);
    addButton(bar, "Owner", loginOwner);
    addButton(bar, "Admin", loginAdmin);

    var mount = document.getElementById("swagger-ui");
    if (mount && mount.parentNode) {
      mount.parentNode.insertBefore(bar, mount);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
`;
}

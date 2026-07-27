import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the date invitation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Пойдёшь со мной на свидание\?<\/title>/i);
  assert.match(html, /Пойдёшь со мной/);
  assert.match(html, /Выберем вместе/);
  assert.match(html, /Да, конечно/);
  assert.doesNotMatch(html, /codex-preview|Building your site/i);
});

test("keeps no non-actionable and opens a real date step", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /onPointerEnter=\{dodgeNo\}/);
  assert.match(page, /event\.preventDefault\(\)/);
  assert.doesNotMatch(page, /onClick=\{dodgeNo\}/);
  assert.match(page, /onClick=\{\(\) => setStep\("date"\)\}/);
  assert.match(page, /role="grid"/);
  assert.match(page, /getCalendarDays/);
  assert.match(page, /Следующий месяц/);
  assert.match(page, /Подтвердить дату/);
});

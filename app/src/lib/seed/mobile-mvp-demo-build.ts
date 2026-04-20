import type { BuildProject } from "@/types";

/**
 * Static BuildProject backing the seeded "Mobile App MVP" demo space (space-3).
 *
 * Hand-rolled (not generated via `mockBuildFromOutput`) so it can live in the
 * store's *initial state* with stable IDs — that lets the seeded Output's
 * `buildProjectId` reference resolve deterministically across reloads.
 *
 * Shape mirrors what `mockBuildFromOutput` produces for the mobile path:
 *   - framework: "expo", targetPlatform: "mobile"
 *   - one route ("/") whose `previewHtml` is a phone-shell-wrapped Activity Home
 *   - `snackSource` for the On Device tab's Snack runner
 */

const homePreviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Activity Home</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; background: #fafafa; color: #18181b; }
    .stage { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; background: linear-gradient(180deg, #0a0a0a, #18181b); }
    .device { width: 360px; height: 720px; background: #ffffff; border-radius: 36px; border: 10px solid #0a0a0a; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column; position: relative; }
    .island { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 96px; height: 24px; border-radius: 999px; background: #0a0a0a; z-index: 5; }
    .home { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 110px; height: 4px; border-radius: 999px; background: rgba(0,0,0,0.25); z-index: 5; }
    .statusbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px 8px; font-size: 11px; font-weight: 600; color: #18181b; }
    .content { flex: 1; overflow: auto; padding: 8px 18px 12px; }
    .greeting { font-size: 12px; color: #71717a; margin: 0 0 2px; }
    .name { font-size: 22px; font-weight: 700; margin: 0 0 16px; color: #18181b; }
    .ring-card { display: flex; gap: 14px; padding: 16px; border-radius: 18px; background: linear-gradient(135deg, #7c6ef5 0%, #a294fb 100%); color: #fff; margin-bottom: 14px; align-items: center; }
    .ring { width: 78px; height: 78px; border-radius: 50%; border: 8px solid rgba(255,255,255,0.25); border-top-color: #fff; transform: rotate(-30deg); }
    .ring-stats { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .ring-stats .big { font-size: 24px; font-weight: 700; line-height: 1.1; }
    .ring-stats .label { font-size: 11px; opacity: 0.85; }
    .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
    .stat { background: #f4f4f5; border-radius: 12px; padding: 10px; text-align: center; }
    .stat .v { font-size: 14px; font-weight: 700; color: #18181b; }
    .stat .k { font-size: 10px; color: #71717a; margin-top: 2px; }
    .section { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin: 8px 0; }
    .activity { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #e4e4e7; border-radius: 12px; margin-bottom: 6px; }
    .activity .icon { width: 28px; height: 28px; border-radius: 50%; background: #ede9fe; color: #7c6ef5; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .activity .meta { flex: 1; }
    .activity .meta .title { font-size: 13px; font-weight: 600; color: #18181b; }
    .activity .meta .sub { font-size: 11px; color: #71717a; margin-top: 1px; }
    .cta { display: block; width: 100%; padding: 12px; border: none; border-radius: 14px; background: #18181b; color: #fff; font-weight: 600; font-size: 13px; margin-top: 8px; cursor: pointer; }
    .tabbar { display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 0 18px; border-top: 1px solid #e4e4e7; background: #ffffff; font-size: 10px; color: #52525b; }
    .tab { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .tab .dot { width: 14px; height: 14px; border-radius: 4px; background: #d4d4d8; }
    .tab.active { color: #7c6ef5; }
    .tab.active .dot { background: #7c6ef5; }
  </style>
</head>
<body>
  <div class="stage">
    <div class="device" data-figred-component="App">
      <div class="island"></div>
      <div class="statusbar"><span>9:41</span><span>● ▮ ▮▮</span></div>
      <div class="content">
        <p class="greeting">Good morning</p>
        <p class="name">Pratea</p>
        <div class="ring-card" data-figred-component="ProgressRingCard">
          <div class="ring"></div>
          <div class="ring-stats">
            <span class="big">7,420</span>
            <span class="label">steps · 62% of goal</span>
          </div>
        </div>
        <div class="row">
          <div class="stat"><div class="v">38</div><div class="k">active min</div></div>
          <div class="stat"><div class="v">412</div><div class="k">kcal</div></div>
          <div class="stat"><div class="v">5.2</div><div class="k">km</div></div>
        </div>
        <div class="section">Recent activity</div>
        <div class="activity">
          <div class="icon">R</div>
          <div class="meta"><div class="title">Morning run</div><div class="sub">3.2 km · 18 min · today</div></div>
        </div>
        <div class="activity">
          <div class="icon">Y</div>
          <div class="meta"><div class="title">Yoga</div><div class="sub">25 min · yesterday</div></div>
        </div>
        <button class="cta" data-figred-component="LogWorkoutCTA">Log workout</button>
      </div>
      <div class="tabbar">
        <div class="tab active"><div class="dot"></div><span>Home</span></div>
        <div class="tab"><div class="dot"></div><span>Activity</span></div>
        <div class="tab"><div class="dot"></div><span>Insights</span></div>
        <div class="tab"><div class="dot"></div><span>Profile</span></div>
      </div>
      <div class="home"></div>
    </div>
  </div>
</body>
</html>`;

const snackSource = `import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.greeting}>Good morning</Text>
        <Text style={s.name}>Pratea</Text>

        <View style={s.ringCard}>
          <View style={s.ring} />
          <View style={s.ringStats}>
            <Text style={s.bigNum}>7,420</Text>
            <Text style={s.bigLabel}>steps · 62% of goal</Text>
          </View>
        </View>

        <View style={s.statRow}>
          {[
            { v: '38', k: 'active min' },
            { v: '412', k: 'kcal' },
            { v: '5.2', k: 'km' },
          ].map((m) => (
            <View key={m.k} style={s.stat}>
              <Text style={s.statV}>{m.v}</Text>
              <Text style={s.statK}>{m.k}</Text>
            </View>
          ))}
        </View>

        <Text style={s.section}>Recent activity</Text>
        {[
          { i: 'R', t: 'Morning run', d: '3.2 km · 18 min · today' },
          { i: 'Y', t: 'Yoga', d: '25 min · yesterday' },
        ].map((a) => (
          <View key={a.t} style={s.activity}>
            <View style={s.icon}><Text style={s.iconTxt}>{a.i}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.aTitle}>{a.t}</Text>
              <Text style={s.aSub}>{a.d}</Text>
            </View>
          </View>
        ))}

        <Pressable style={s.cta}>
          <Text style={s.ctaTxt}>Log workout</Text>
        </Pressable>
      </ScrollView>

      <View style={s.tabbar}>
        {['Home', 'Activity', 'Insights', 'Profile'].map((label, i) => (
          <View key={label} style={s.tab}>
            <View style={[s.dot, i === 0 && s.dotActive]} />
            <Text style={[s.tabLabel, i === 0 && s.tabLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 18 },
  greeting: { color: '#71717a', fontSize: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#18181b', marginBottom: 16 },
  ringCard: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: 18, backgroundColor: '#7c6ef5', marginBottom: 14, alignItems: 'center' },
  ring: { width: 78, height: 78, borderRadius: 39, borderWidth: 8, borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' },
  ringStats: { flex: 1 },
  bigNum: { color: '#fff', fontSize: 24, fontWeight: '700' },
  bigLabel: { color: '#fff', opacity: 0.85, fontSize: 11 },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: '#f4f4f5', borderRadius: 12, padding: 10, alignItems: 'center' },
  statV: { fontSize: 14, fontWeight: '700', color: '#18181b' },
  statK: { fontSize: 10, color: '#71717a', marginTop: 2 },
  section: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#71717a', marginVertical: 8 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: '#e4e4e7', borderRadius: 12, marginBottom: 6 },
  icon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  iconTxt: { color: '#7c6ef5', fontSize: 13, fontWeight: '700' },
  aTitle: { fontSize: 13, fontWeight: '600', color: '#18181b' },
  aSub: { fontSize: 11, color: '#71717a', marginTop: 1 },
  cta: { padding: 12, borderRadius: 14, backgroundColor: '#18181b', alignItems: 'center', marginTop: 8 },
  ctaTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingVertical: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 4, backgroundColor: '#d4d4d8' },
  dotActive: { backgroundColor: '#7c6ef5' },
  tabLabel: { fontSize: 10, color: '#52525b' },
  tabLabelActive: { color: '#7c6ef5' },
});
`;

export const MOBILE_MVP_BUILD_PROJECT_ID = "build-mobile-mvp-demo";
export const MOBILE_MVP_BUILT_OUTPUT_ID = "out-mvp-built";

export const mobileMvpDemoBuildProject: BuildProject = {
  id: MOBILE_MVP_BUILD_PROJECT_ID,
  outputId: MOBILE_MVP_BUILT_OUTPUT_ID,
  name: "activity-tracker",
  framework: "expo",
  files: [
    {
      id: "f-mvp-pkg",
      path: "package.json",
      name: "package.json",
      language: "json",
      content: JSON.stringify(
        {
          name: "activity-tracker",
          private: true,
          version: "0.1.0",
          dependencies: {
            expo: "~52.0.0",
            react: "19.0.0",
            "react-native": "0.76.0",
          },
        },
        null,
        2
      ),
    },
    {
      id: "f-mvp-app",
      path: "App.tsx",
      name: "App.tsx",
      language: "tsx",
      content: snackSource,
    },
    {
      id: "f-mvp-tsconfig",
      path: "tsconfig.json",
      name: "tsconfig.json",
      language: "json",
      content: JSON.stringify(
        {
          extends: "expo/tsconfig.base",
          compilerOptions: { strict: true },
        },
        null,
        2
      ),
    },
  ],
  routes: [
    {
      path: "/",
      label: "Home",
      filePath: "App.tsx",
      previewHtml: homePreviewHtml,
    },
  ],
  dependencies: {
    expo: "~52.0.0",
    react: "19.0.0",
    "react-native": "0.76.0",
  },
  entryFile: "App.tsx",
  targetPlatform: "mobile",
  snackSource,
};

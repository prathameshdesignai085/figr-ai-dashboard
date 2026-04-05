/** Simple markdown to inline-styled HTML for canvas previews and design editor parsing. */
export function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /^### (.+)$/gm,
      '<h3 style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);margin:10px 0 4px 0;line-height:1.3">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);margin:12px 0 4px 0;line-height:1.3">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 style="font-size:16px;font-weight:700;color:rgba(255,255,255,0.9);margin:0 0 8px 0;line-height:1.3">$1</h1>'
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong style="color:rgba(255,255,255,0.85);font-weight:600">$1</strong>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code style="background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px;font-size:11px;font-family:monospace;color:rgba(255,255,255,0.7)">$1</code>'
    )
    .replace(
      /```[\s\S]*?\n([\s\S]*?)```/g,
      '<pre style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:8px 10px;margin:6px 0;overflow-x:auto;font-size:10px;line-height:1.5;font-family:\'SF Mono\',Monaco,monospace;color:rgba(255,255,255,0.6);white-space:pre">$1</pre>'
    )
    .replace(
      /^(\d+)\. (.+)$/gm,
      '<div style="display:flex;gap:6px;margin:2px 0 2px 4px;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.5)"><span style="color:rgba(255,255,255,0.25);min-width:14px">$1.</span><span>$2</span></div>'
    )
    .replace(
      /^- (.+)$/gm,
      '<div style="display:flex;gap:6px;margin:2px 0 2px 4px;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.5)"><span style="color:rgba(255,255,255,0.2)">\u2022</span><span>$1</span></div>'
    )
    .replace(
      /^(?!<[hpdu]|<pre|<div|<strong|<code)(.+)$/gm,
      '<p style="font-size:12px;line-height:1.5;color:rgba(255,255,255,0.5);margin:3px 0">$1</p>'
    )
    .replace(/^\s*$/gm, "");
}

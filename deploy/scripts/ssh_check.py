#!/usr/bin/env python3
"""SSH helper: run commands on remote server via paramiko or subprocess+pexpect."""
import subprocess, sys, os

HOST = os.environ.get("YOUQINGGONG_DEPLOY_HOST", "")
USER = os.environ.get("YOUQINGGONG_DEPLOY_USER", "")
PASS = os.environ.get("YOUQINGGONG_DEPLOY_PASSWORD", "")

def run_via_expect(cmd):
    if not HOST or not USER or not PASS:
        raise SystemExit("Missing YOUQINGGONG_DEPLOY_HOST / YOUQINGGONG_DEPLOY_USER / YOUQINGGONG_DEPLOY_PASSWORD")
    script = f"""#!/usr/bin/expect -f
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 {USER}@{HOST} "{cmd}"
expect {{
    "password:" {{ send "{PASS}\\r"; exp_continue }}
    "\\$"       {{ }}
    eof         {{ }}
    timeout     {{ exit 1 }}
}}
expect eof
"""
    with open("/tmp/ssh_cmd.exp", "w") as f:
        f.write(script)
    os.chmod("/tmp/ssh_cmd.exp", 0o755)
    result = subprocess.run(["/usr/bin/expect", "/tmp/ssh_cmd.exp"],
                            capture_output=True, text=True, timeout=60)
    return result.stdout + result.stderr

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "uname -a"
    print(run_via_expect(cmd))

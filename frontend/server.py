#!/usr/bin/env python3
"""
Simple HTTP Server for Frontend Development
Serves static files with CORS support
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class CORSRequestHandler(SimpleHTTPRequestHandler):
    """Handler with CORS support"""
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

def main():
    PORT = 3000
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    
    print(f"""
╔═══════════════════════════════════════════╗
║   Frontend Server Started                 ║
╚═══════════════════════════════════════════╝

📍 Server: http://localhost:{PORT}
📂 Directory: {os.getcwd()}
⚙️  CORS: Enabled
🛑 To stop: Press Ctrl+C

""")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped")
        sys.exit(0)

if __name__ == '__main__':
    main()

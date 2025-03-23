from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加 CORS 头
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# 启动服务器
server_address = ('', 8000)
httpd = HTTPServer(server_address, CORSRequestHandler)
httpd.serve_forever()
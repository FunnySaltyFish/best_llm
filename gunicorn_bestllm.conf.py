#import multiprocessing
# 绑定ip和端口号
bind = '127.0.0.1:8010'
# 并行工作进程数
#workers = multiprocessing.cpu_count() * 2 + 1
workers = 2

# 还可以使用 gevent 模式，还可以使用sync模式，默认sync模式
worker_class = 'uvicorn.workers.UvicornWorker'

# 指定每个工作者的线程数
threads = 4

# 监听队列
backlog = 2048

# 超过多少秒后工作将被杀掉，并重新启动。一般设置为30秒或更多
timeout = 30

# 设置最大并发量
worker_connections = 1000

# 默认False，设置守护进程，将进程交给supervisor管理
#daemon = False

debug = True

loglevel = 'debug'

# 默认None，这会影响ps和top。如果要运行多个Gunicorn实例，
# 需要设置一个名称来区分，这就要安装setproctitle模块。如果未安装
proc_name = 'bestllm'

# 设置进程文件目录
#pidfile = './pid/gunicron.pid'

# 访问日志文件
accesslog = './logs/access.log'

# 错误日志文件
errorlog = './logs/error.log'
# logger_class = 'gunicron.gologging.Logger'

# 预加载资源
#preload_app = True

#autorestart = True

# 设置gunicron访问日志格式，错误日志无法设置
access_log_format = '%(t)s %(p)s %(h)s "%(r)s" %(s)s %(L)s %(b)s %(f)s" " "%(a)s"'

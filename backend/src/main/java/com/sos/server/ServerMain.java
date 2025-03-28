package com.sos.server;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ServerMain {
    private static final Logger logger = LoggerFactory.getLogger(ServerMain.class);
    private static final int WS_PORT = 7000;

    public static void start() throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            // 只启动WebSocket服务器，TCP服务器由WebSocketTunnelHandler启动
            new ServerBootstrap()
                    .group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ch.pipeline().addLast(
                                    new HttpServerCodec(),
                                    new HttpObjectAggregator(1048576),
                                    new WebSocketServerProtocolHandler(
                                        "/ws", 
                                        null, 
                                        true, // 允许扩展
                                        1048576// 设置握手超时时间为10秒
                                    ),
                                    new WebSocketServerProtocolHandler("/ws"),
                                    new WebSocketTunnelHandler()
                            );
                        }
                    })
                    .bind(WS_PORT).sync();

            logger.info("服务器启动成功，WebSocket端口：{}", WS_PORT);
            Thread.currentThread().join();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
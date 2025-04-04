package com.sos.server;

import io.netty.buffer.ByteBuf;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.util.AttributeKey;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class WebSocketTunnelHandler extends SimpleChannelInboundHandler<BinaryWebSocketFrame> {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketTunnelHandler.class);
    private static final Map<String, Channel> tcpChannelMap = new ConcurrentHashMap<>();
    private ChannelFuture tcpServerFuture; // 用于存储TCP服务器的ChannelFuture
    private final static int LOCAL_PORT = 27016; // 定义端口常量

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        logger.info("WebSocket通道建立：{}", ctx.channel().remoteAddress());
        // 关闭之前的TCP服务器并启动新的TCP服务器
        stopTcpServer();
        startTcpServer(ctx);
    }

    private synchronized void stopTcpServer() {
        if (tcpServerFuture != null) {
            logger.info("关闭之前的TCP服务器...");
            Channel serverChannel = tcpServerFuture.channel();
            
            // 改进1：使用监听器代替阻塞等待
            ChannelFuture closeFuture = serverChannel.close();
            closeFuture.addListener(future -> {
                if (future.isSuccess()) {
                    logger.info("TCP服务器端口已释放");
                    // 改进3：关闭所有子通道
                    tcpChannelMap.values().forEach(ch -> ch.close());
                    tcpChannelMap.clear();
                }
            });
            
            // 改进2：设置合理超时时间（单位：毫秒）
            if (!closeFuture.awaitUninterruptibly(5000)) {
                logger.error("TCP服务器关闭超时，可能存在资源泄漏");
                serverChannel.unsafe().closeForcibly();
            }
            
            tcpServerFuture = null;
        }
    }

    private synchronized void startTcpServer(ChannelHandlerContext ctx) {
        EventLoopGroup group = ctx.channel().eventLoop();
        tcpServerFuture = new ServerBootstrap()
            .group(group)
            .channel(NioServerSocketChannel.class)
            .option(ChannelOption.SO_REUSEADDR, true)
            .childOption(ChannelOption.SO_REUSEADDR, true) // 增加子通道复用设置
            .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) {
                    ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                        @Override
                        public void channelActive(ChannelHandlerContext ctx1) {
                            ctx1.channel().attr(AttributeKey.valueOf("wsChannel")).set(ctx.channel());
                            String uniqueId = UUID.randomUUID().toString();
                            ctx1.channel().attr(AttributeKey.valueOf("uniqueId")).set(uniqueId);
                            // 将TCP通道添加到映射中
                            tcpChannelMap.put(uniqueId, ctx1.channel());
                            logger.debug("TCP通道激活：{}", ctx1.channel().remoteAddress());
                        }

                        @Override
                        public void channelRead(ChannelHandlerContext ctx1, Object msg) {
                            // 生成唯一ID
                            String uniqueId = (String) ctx1.channel().attr(AttributeKey.valueOf("uniqueId")).get();
                            
                            // 将ID写入消息
                            ByteBuf originalMsg = (ByteBuf) msg;
                            ByteBuf newMsg = ctx1.alloc().buffer(originalMsg.readableBytes() + 36);
                            newMsg.writeBytes(uniqueId.getBytes());
                            newMsg.writeBytes(originalMsg);
                        
                            Channel boundWsChannel = (Channel) ctx1.channel().attr(AttributeKey.valueOf("wsChannel")).get();
                            if (boundWsChannel != null && boundWsChannel.isActive()) {
                                boundWsChannel.writeAndFlush(new BinaryWebSocketFrame(newMsg));
                            }

                            // 释放原始消息
                            originalMsg.release();
                            // boundWsChannel.writeAndFlush(new BinaryWebSocketFrame((ByteBuf) msg));
                        }
                    });
                }
            })
            .bind(LOCAL_PORT)
            .addListener((ChannelFutureListener) future -> {
                if (future.isSuccess()) {
                    logger.info("TCP服务器启动成功，端口：{}", LOCAL_PORT);
                } else {
                    logger.error("TCP服务器启动失败：{}", future.cause().getMessage());
                    ctx.close();
                }
            });
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, BinaryWebSocketFrame msg) {
        try {
            BinaryWebSocketFrame frame = (BinaryWebSocketFrame) msg;
            ByteBuf content = frame.content();
            
            // 读取ID
            byte[] idBytes = new byte[36];
            content.readBytes(idBytes);
            String uniqueId = new String(idBytes);
            logger.debug("收到消息ID: {}", uniqueId);
            
            // 处理剩余消息
            ByteBuf remainingMsg = content.readSlice(content.readableBytes());

            // ByteBuf content = msg.content();
            // // 添加调试日志
            // logger.debug("收到WebSocket消息，长度：{}", content.readableBytes());
            
            // // 将ByteBuf转换为可读的字符串并记录日志
            // byte[] bytes = new byte[content.readableBytes()];
            // content.getBytes(content.readerIndex(), bytes);
            // String message = new String(bytes);
            // logger.info("WebSocket转发数据：{}", message);
            Channel tcpChannel = tcpChannelMap.get(uniqueId);
            if (tcpChannel != null && tcpChannel.isActive()) {
                logger.debug("TCP通道状态：active={}, writable={}", 
                    tcpChannel.isActive(), tcpChannel.isWritable());
                
                tcpChannel.writeAndFlush(remainingMsg.retain()).addListener(future -> {
                    if (!future.isSuccess()) {
                        logger.error("数据转发失败：{}", future.cause().getMessage(), future.cause());
                        remainingMsg.release(); // 释放ByteBuf资源
                    }
                });
            } else {
                logger.warn("TCP通道不可用，丢弃消息");
            }
        } catch (Exception e) {
            logger.error("处理WebSocket消息时发生异常：", e);
            
        }
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        stopTcpServer();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        if (cause instanceof IOException) {
            logger.warn("网络连接异常：{}", cause.getMessage());
        } else {
            logger.error("发生未预期异常：{}", cause.toString(), cause); // 增加完整异常堆栈
        }
        stopTcpServer();
    }
}
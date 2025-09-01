import gradio as gr
import os
import numpy as np
import pandas as pd
import time
from pathlib import Path
import json

# 创建必要的目录
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("uploads/fnirs", exist_ok=True)
os.makedirs("uploads/eeg", exist_ok=True)

# 模拟两个智能体的对话历史
conversation_history = []

# 模拟智能体回复
def agent_response(user_input, agent_id):
    if agent_id == 1:
        return f"智能体1回应: 我收到了你的消息 - '{user_input}'"
    else:
        return f"智能体2回应: 我收到了你的消息 - '{user_input}'"

# 处理对话
def add_to_conversation(message, agent_id):
    global conversation_history
    if agent_id == 1:
        agent_name = "智能体1"
    else:
        agent_name = "智能体2"
    
    conversation_history.append((agent_name, message))
    
    # 构建对话历史显示
    conversation_display = ""
    for name, msg in conversation_history:
        conversation_display += f"<div style='padding: 10px; margin: 5px; border-radius: 10px; background-color: {'#d1e7dd' if name == '智能体1' else '#cfe2ff'};'><b>{name}:</b> {msg}</div>"
    
    return conversation_display + "<script>(function(){var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight;}})();</script><img src=x onerror=\"var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight}\" style=display:none>"

# 读取 example/chat.json 并输出为HTML字符串（与现有对话卡片风格一致）
def export_example_chat_html():
    # 仅增加此函数，尽量不改动其它逻辑
    json_path = Path(__file__).parent / "example" / "chat.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 拼接为HTML，保持与 add_to_conversation 生成的卡片风格相近
    # 外层包一层可滚动容器，避免超长内容撑破外层（最小变更，不动全局CSS）
    conversation_display = (
        "<div style='display: flow-root; max-height: 460px; overflow-y: auto;"
        " box-sizing: border-box; padding-bottom: 8px;'>"
    )

    def background_color(role: str) -> str:
        r = role.lower().strip()
        if r == "agent a":
            return "#d1e7dd"  # 绿
        if r == "agent b":
            return "#cfe2ff"  # 蓝
        if r == "decider":
            return "#fff3cd"  # 明显的浅黄（裁决/判定）
        return "#f8f9fa"       # 默认灰（其它/系统）

    for section in ("start", "argue", "decision"):
        for item in data.get(section, []):
            role = item.get("role", "")
            content = item.get("content", "")
            bg = background_color(role)
            conversation_display += (
                f"<div style='padding: 10px; margin: 5px; border-radius: 10px; background-color: {bg};'>"
                f"<b>{role}:</b> {content}</div>"
            )

    return conversation_display + "</div>" + "<script>(function(){var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight;}})();</script><img src=x onerror=\"var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight}\" style=display:none>"

# 流式演示：每2秒追加一条示例对话并更新界面
def stream_example_chat():
    json_path = Path(__file__).parent / "example" / "chat.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    def background_color(role: str) -> str:
        r = role.lower().strip()
        if r == "agent a":
            return "#d1e7dd"
        if r == "agent b":
            return "#cfe2ff"
        if r == "decider":
            return "#fff3cd"
        return "#f8f9fa"

    items = []
    for section in ("start", "argue", "decision"):
        for item in data.get(section, []):
            items.append(item)
            html = "<div style='display: flow-root; padding-bottom: 8px;'>"
            for it in items:
                role = it.get("role", "")
                content = it.get("content", "")
                bg = background_color(role)
                html += (
                    f"<div style='padding: 10px; margin: 5px; border-radius: 10px; background-color: {bg};'>"
                    f"<b>{role}:</b> {content}</div>"
                )
            html += "</div><script>(function(){var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight;}})();</script><img src=x onerror=\"var el=document.querySelector('.prose.agent-chat');if(el){el.scrollTop=el.scrollHeight}\" style=display:none>"
            yield html
            time.sleep(2)

# 处理视频上传
def process_video(video):
    if video is None:
        return "未上传视频"
    
    # 获取视频文件名和扩展名
    video_path = Path(video)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    new_filename = f"video_{timestamp}{video_path.suffix}"
    save_path = os.path.join("uploads/videos", new_filename)
    
    # 复制视频到目标文件夹
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(video, "rb") as f_in:
        with open(save_path, "wb") as f_out:
            f_out.write(f_in.read())
    
    # 向对话添加视频上传信息
    conversation_display = add_to_conversation(f"上传了视频: {new_filename}", 1)
    # 模拟智能体回应
    response = agent_response(f"收到视频: {new_filename}", 2)
    conversation_display = add_to_conversation(response, 2)
    
    return conversation_display

# 处理fNIRS数据上传
def process_fnirs(file):
    if file is None:
        return "未上传fNIRS数据"
    
    # 获取文件名和扩展名
    file_path = Path(file)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    new_filename = f"fnirs_{timestamp}{file_path.suffix}"
    save_path = os.path.join("uploads/fnirs", new_filename)
    
    # 复制文件到目标文件夹
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(file, "rb") as f_in:
        with open(save_path, "wb") as f_out:
            f_out.write(f_in.read())
    
    # 如果是CSV文件，尝试读取并显示一些基本统计信息
    if file_path.suffix.lower() == '.csv':
        try:
            df = pd.read_csv(file)
            stats_info = f"数据形状: {df.shape[0]}行 x {df.shape[1]}列"
        except:
            stats_info = "无法解析CSV数据"
    else:
        stats_info = "上传了非CSV格式数据"
    
    # 向对话添加fNIRS上传信息
    conversation_display = add_to_conversation(f"上传了fNIRS数据: {new_filename}", 1)
    # 模拟智能体回应
    response = agent_response(f"收到fNIRS数据: {stats_info}", 2)
    conversation_display = add_to_conversation(response, 2)
    
    return conversation_display

# 处理EEG数据上传
def process_eeg(file):
    if file is None:
        return "未上传EEG数据"
    
    # 获取文件名和扩展名
    file_path = Path(file)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    new_filename = f"eeg_{timestamp}{file_path.suffix}"
    save_path = os.path.join("uploads/eeg", new_filename)
    
    # 复制文件到目标文件夹
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(file, "rb") as f_in:
        with open(save_path, "wb") as f_out:
            f_out.write(f_in.read())
    
    # 如果是CSV文件，尝试读取并显示一些基本统计信息
    if file_path.suffix.lower() == '.csv':
        try:
            df = pd.read_csv(file)
            stats_info = f"数据形状: {df.shape[0]}行 x {df.shape[1]}列"
        except:
            stats_info = "无法解析CSV数据"
    else:
        stats_info = "上传了非CSV格式数据"
    
    # 向对话添加EEG上传信息
    conversation_display = add_to_conversation(f"上传了EEG数据: {new_filename}", 1)
    # 模拟智能体回应
    response = agent_response(f"收到EEG数据: {stats_info}", 2)
    conversation_display = add_to_conversation(response, 2)
    
    return conversation_display

# 用户发送文本消息
def send_message(message, conversation_state):
    if not message:
        return conversation_state
    
    # 检查是否为特定的分析请求
    if "请分析受试者的心理情况" in message:
        # 直接加载示例对话作为回应
        return export_example_chat_html()
    
    # 普通消息处理
    # 向对话添加用户消息
    conversation_display = add_to_conversation(message, 1)
    # 模拟智能体回应
    response = agent_response(message, 2)
    conversation_display = add_to_conversation(response, 2)
    
    return conversation_display

# 创建Gradio界面
with gr.Blocks(css="""
    .block.agent-chat {
        min-height: 400px;
        max-height: 500px;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 15px;
        background-color: #f9f9f9;
    }
    /* 内层实际渲染区域承担滚动，且不再绘制边框/背景，避免双边框与溢出 */
    .prose.agent-chat {
        max-height: 500px;
        overflow-y: auto;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        box-sizing: border-box;
        scroll-behavior: smooth;
    }
    /* 最后一条卡片去掉底部外边距，避免视觉越界 */
    .prose.agent-chat > div:last-child { margin-bottom: 0 !important; }
    /* 确保长内容能换行不撑宽 */
    .prose.agent-chat { word-break: break-word; overflow-wrap: anywhere; }
    .upload-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }
    .upload-button {
        flex: 1;
    }
    .footer {
        text-align: center;
        margin-top: 20px;
        color: #666;
    }
""") as demo:
    gr.Markdown("# 连心智诊师:用心连接,治愈心灵")
    
    with gr.Row():
        with gr.Column():
            # 中间区域 - 对话区
            gr.Markdown("## 智能体对话")
            chat_display = gr.HTML(value="<div style='text-align: center; color: #666;'>对话将在此处显示</div>", elem_classes=["agent-chat"])
            
            # 文本输入
            with gr.Row():
                with gr.Column(scale=8):
                    user_message = gr.Textbox(label="输入消息", placeholder="在这里输入文本消息...", lines=2)
                with gr.Column(scale=1, min_width=96):
                    send_btn = gr.Button("发送")
                    stream_btn = gr.Button("演示加载")                
            
            # 文件上传区域
            gr.Markdown("## 数据上传")
            with gr.Row(elem_classes=["upload-row"]):
                with gr.Column(elem_classes=["upload-button"]):
                    video_upload = gr.Video(label="视频", sources="upload")
                    video_submit = gr.Button("上传视频", variant="primary")
                
                with gr.Column(elem_classes=["upload-button"]):
                    fnirs_upload = gr.File(label="fNIRS数据")
                    fnirs_submit = gr.Button("上传fNIRS数据", variant="primary")
                
                with gr.Column(elem_classes=["upload-button"]):
                    eeg_upload = gr.File(label="EEG数据")
                    eeg_submit = gr.Button("上传EEG数据", variant="primary")
    
    # 页脚
    gr.Markdown("---\n### 连心智诊师 © 2025", elem_classes=["footer"])
    
    # 设置事件处理
    send_btn.click(send_message, [user_message, chat_display], [chat_display])
    user_message.submit(send_message, [user_message, chat_display], [chat_display])
    stream_btn.click(stream_example_chat, [], [chat_display])
    
    video_submit.click(process_video, [video_upload], [chat_display])
    fnirs_submit.click(process_fnirs, [fnirs_upload], [chat_display])
    eeg_submit.click(process_eeg, [eeg_upload], [chat_display])

# 启动应用
if __name__ == "__main__":
    # 初始化对话
    initial_msg = "系统初始化完成，两个智能体已准备就绪。"
    conversation_history.append(("系统", initial_msg))
    
    # 启动Gradio应用
    demo.launch(share=False, server_name="0.0.0.0")

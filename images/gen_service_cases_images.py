import cv2
import os
import random
import numpy as np

def create_directories():
    """创建所需的目录结构"""
    categories = {
        "eye_fatigue": "Eye Fatigue Care",
        "eye_decline": "Eye Decline Care",
        "eye_sensitivity": "Eye Sensitivity Care",
        "comprehensive": "Comprehensive Care"
    }
    
    for category in categories:
        os.makedirs(os.path.join("service-cases", category), exist_ok=True)
    return categories

def split_and_resize_image(image_path):
    """将图片左右切分并调整大小为640x480"""
    img = cv2.imread(image_path)
    if img is None:
        print(f"无法读取图片: {image_path}")
        return None, None
    
    height, width = img.shape[:2]
    left_img = img[:, :width//2]
    right_img = img[:, width//2:]
    
    # 调整大小为640x480
    left_img = cv2.resize(left_img, (640, 480))
    right_img = cv2.resize(right_img, (640, 480))
    
    return left_img, right_img

def add_text_to_image(img, category, case_num, is_before):
    """在图片左下角和右下角添加文字"""
    # 设置字体参数
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    thickness = 2
    text_color = (255, 200, 100)  # 浅蓝色 (BGR格式)
    
    # 添加左下角文字（类别）
    category_text = category
    (text_width, text_height), _ = cv2.getTextSize(category_text, font, font_scale, thickness)
    cv2.putText(img, category_text, (10, img.shape[0]-10), font, font_scale, text_color, thickness)
    
    # 添加右下角文字（案例编号和状态）
    status_text = "Before" if is_before else "After"
    case_text = f"Case {case_num} - {status_text}"
    (text_width, text_height), _ = cv2.getTextSize(case_text, font, font_scale, thickness)
    cv2.putText(img, case_text, (img.shape[1]-text_width-10, img.shape[0]-10), font, font_scale, text_color, thickness)
    
    return img

def process_images():
    """处理所有图片并生成案例"""
    # 创建目录并获取中英文映射
    categories = create_directories()
    
    # 获取所有图片文件
    image_files = [f for f in os.listdir("original-images") if f.lower().endswith(('.png', '.jpg', '.jpeg','.jfif'))]
    
    # 处理每张图片
    all_split_images = []
    for image_file in image_files:
        left_img, right_img = split_and_resize_image(os.path.join("original-images", image_file))
        if left_img is not None and right_img is not None:
            all_split_images.append((left_img, right_img))
    
    # 为每个类别生成11组案例
    for en_category, cn_category in categories.items():
        # 随机选择11组图片
        selected_pairs = random.sample(all_split_images, 11)
        
        # 保存图片
        for i, (before_img, after_img) in enumerate(selected_pairs, 1):
            # 添加文字
            before_img = add_text_to_image(before_img, cn_category, i, is_before=True)
            after_img = add_text_to_image(after_img, cn_category, i, is_before=False)
            
            # 保存图片到英文目录
            cv2.imwrite(os.path.join("service-cases", en_category, f"case{i}_before.jpg"), before_img)
            cv2.imwrite(os.path.join("service-cases", en_category, f"case{i}_after.jpg"), after_img)

if __name__ == "__main__":
    process_images()
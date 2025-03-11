// 修改 API 配置，确保可以被其他文件访问
window.apiConfig = {
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    apiKey: "sk-2e00e62e3a904a5cb639742cd3adfe57",
    model: "qwen-max-2025-01-25",
    stream: false,
    max_tokens: 4000,
    temperature: 0.7
};

// 验证码配置
const VERIFICATION_CODE = 'agiatme.com';

// 验证码检查函数
function verifyCode() {
    const input = document.getElementById('verificationCode');
    const overlay = document.getElementById('verificationOverlay');
    const error = document.getElementById('verificationError');
    
    if (input.value === VERIFICATION_CODE) {
        overlay.style.display = 'none';
        // 存储验证状态到 sessionStorage
        sessionStorage.setItem('verified', 'true');
    } else {
        error.style.display = 'block';
        input.value = '';
        setTimeout(() => {
            error.style.display = 'none';
        }, 3000);
    }
}

// 页面加载时检查验证码
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经验证过
    const verified = sessionStorage.getItem('verified');
    if (!verified) {
        document.getElementById('verificationOverlay').style.display = 'flex';
    }
    
    // 为验证码输入框添加回车键监听
    const input = document.getElementById('verificationCode');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyCode();
        }
    });
});

// 页面切换逻辑
function showForm(type) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    document.getElementById('formSection').style.display = 'block';
    
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => form.style.display = 'none');
    
    const currentForm = document.getElementById(`${type}Form`);
    if (currentForm) {
        currentForm.style.display = 'block';
        
        // 在表单显示后再添加搜索功能
        const searchInput = document.getElementById(`${type}Search`);
        if (searchInput) {
            searchInput.value = ''; // 清空搜索框
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const tbody = document.getElementById(`${type}TableBody`);
                if (tbody) {
                    const rows = tbody.getElementsByTagName('tr');
                    Array.from(rows).forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(searchTerm) ? '' : 'none';
                    });
                }
            });
        }
    }
    
    refreshDataTable(type);
}

function showDashboard() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    document.getElementById('dashboardSection').style.display = 'block';
    updateDashboardStats();
    initDashboard();
}

function showAIChat() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    const aiChatSection = document.getElementById('aiChatSection');
    aiChatSection.style.display = 'block';
    
    // 检查是否已经创建了iframe
    const aiChatContent = document.getElementById('aiChatContent');
    if (!aiChatContent.querySelector('iframe')) {
        // 准备要传递的数据
        const relationshipData = store.getRelationshipData();
        const eventTimelineData = store.getEventTimeline();
        const influenceChartData = store.getInfluenceData();
        const businessData = store.getBusinesses();
        const organizationData = store.getOrganizations();
        
        // 创建带数据的iframe
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';  // 保持100%高度
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';  // 添加圆角
        iframe.style.backgroundColor = '#fff';  // 添加背景色
        
        // 通过URL参数传递所有数据，包括API配置
        const params = new URLSearchParams({
            relationshipData: JSON.stringify(relationshipData),
            eventTimelineData: JSON.stringify(eventTimelineData),
            influenceChartData: JSON.stringify(influenceChartData),
            businessData: JSON.stringify(businessData),
            organizationData: JSON.stringify(organizationData),
            apiConfig: JSON.stringify(window.apiConfig)  // 添加API配置
        });
        
        iframe.src = `consult.html?${params.toString()}`;
        aiChatContent.appendChild(iframe);
    }
}

// 加载必要的脚本
function loadRequiredScripts() {
    // 确保所需库都已加载
    const scripts = [
        { src: "https://cdn.staticfile.org/mermaid/10.6.1/mermaid.min.js" },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js" },
        { src: "https://cdn.jsdelivr.net/npm/chart.js" },
        { src: "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels" }
    ];
    
    scripts.forEach(script => {
        if (!document.querySelector(`script[src="${script.src}"]`)) {
            const scriptElement = document.createElement('script');
            scriptElement.src = script.src;
            document.head.appendChild(scriptElement);
        }
    });
}

// 初始化AI聊天功能
function initializeAIChat() {
    // 初始化 Mermaid
    if (window.mermaid) {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }
        });
    }
    
    // 绑定发送消息事件
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    
    if (sendButton && userInput) {
        sendButton.onclick = sendMessage;
        userInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };
    }
    
    // 初始化历史记录管理器
    if (!window.historyManager) {
        window.historyManager = new HistoryManager();
    }
}

// 视图切换函数
function toggleView(type) {
    const formView = document.getElementById(`${type}FormView`);
    const listView = document.getElementById(`${type}ListView`);
    
    if (formView.style.display === 'none') {
        formView.style.display = 'block';
        listView.style.display = 'none';
        document.querySelector(`#${type}Form .btn-switch`).textContent = '切换到列表视图';
    } else {
        formView.style.display = 'none';
        listView.style.display = 'block';
        document.querySelector(`#${type}Form .btn-switch`).textContent = '切换到表单视图';
        refreshDataTable(type);
    }
}

// 刷新数据表格
function refreshDataTable(type) {
    const tbody = document.getElementById(`${type}TableBody`);
    tbody.innerHTML = '';
    
    let data;
    switch(type) {
        case 'person':
            data = store.getPeople();
            data.forEach(person => {
                tbody.innerHTML += `
                    <tr>
                        <td>${person.name}</td>
                        <td>${person.department}</td>
                        <td>${person.position}</td>
                        <td class="description-cell">
                            <div class="description-preview">
                                ${person.power || '暂无描述'}
                            </div>
                        </td>
                        <td class="description-cell">
                            <div class="description-preview">
                                ${person.relationships || '暂无描述'}
                            </div>
                        </td>
                        <td class="action-buttons">
                            <button class="btn-edit" onclick="editPerson('${person.id}')">编辑</button>
                            <button class="btn-delete" onclick="deletePerson('${person.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });
            break;
        case 'event':
            data = store.getEvents();
            data.forEach(event => {
                const relatedPeopleNames = event.relatedPersons
                    .map(id => {
                        const person = store.getPeople().find(p => p.id === id);
                        return person ? person.name : '';
                    })
                    .filter(name => name)
                    .join('、');
                
                tbody.innerHTML += `
                    <tr>
                        <td>${event.title}</td>
                        <td class="description-cell">
                            <div class="description-preview">
                                ${event.description || '暂无描述'}
                            </div>
                        </td>
                        <td data-type="datetime">${new Date(event.startDate).toLocaleString()}</td>
                        <td data-type="datetime">${new Date(event.endDate).toLocaleString()}</td>
                        <td data-type="people">${relatedPeopleNames || '无'}</td>
                        <td class="action-buttons">
                            <button class="btn-edit" onclick="editEvent('${event.id}')">编辑</button>
                            <button class="btn-delete" onclick="deleteEvent('${event.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });
            break;
        case 'organization':
            data = store.getOrganizations();
            data.forEach(org => {
                const parentOrg = org.parentId ? 
                    store.getOrganizations().find(o => o.id === org.parentId) : null;
                
                tbody.innerHTML += `
                    <tr>
                        <td>${org.name}</td>
                        <td>${org.type}</td>
                        <td>${parentOrg ? parentOrg.name : '无'}</td>
                        <td class="description-cell">
                            <div class="description-preview">
                                ${org.description || '暂无描述'}
                            </div>
                        </td>
                        <td class="action-buttons">
                            <button class="btn-edit" onclick="editOrganization('${org.id}')">编辑</button>
                            <button class="btn-delete" onclick="deleteOrganization('${org.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });
            break;
        case 'business':
            data = store.getBusinesses();
            data.forEach(business => {
                const department = store.getOrganizationById(business.departmentId);
                tbody.innerHTML += `
                    <tr>
                        <td>${business.name}</td>
                        <td>${business.type}</td>
                        <td>${department ? department.name : '未指定'}</td>
                        <td class="description-cell">
                            <div class="description-preview">
                                ${business.description || '暂无描述'}
                            </div>
                        </td>
                        <td>
                            <span class="status-badge status-${business.status.replace(/\s+/g, '-').toLowerCase()}">
                                ${business.status}
                            </span>
                        </td>
                        <td class="action-buttons">
                            <button class="btn-edit" onclick="editBusiness('${business.id}')">编辑</button>
                            <button class="btn-delete" onclick="deleteBusiness('${business.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });
            break;
    }
}

// 编辑人物信息
function editPerson(id) {
    const person = store.getPeople().find(p => p.id === id);
    if (!person) return;
    
    // 显示模态框并填充数据
    showPersonModal(id);
}

// 删除人物信息
function deletePerson(id) {
    if (confirm('确定要删除这条记录吗？')) {
        store.deletePerson(id);
        refreshDataTable('person');
    }
}

// 修改表单提交处理
document.getElementById('personManageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const person = {
        name: document.getElementById('personName').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        power: document.getElementById('power').value,
        relationships: document.getElementById('relationships').value
    };
    
    const editId = this.dataset.editId;
    if (editId) {
        // 更新现有记录
        store.updatePerson(editId, person);
        delete this.dataset.editId;
    } else {
        // 添加新记录
        store.addPerson(person);
    }
    
    this.reset();
    toggleView('person');
    alert(editId ? '更新成功！' : '添加成功！');
});

// 表单提交处理
document.getElementById('organizationManageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const organization = {
        name: document.getElementById('orgName').value,
        type: document.getElementById('orgType').value,
        parentId: document.getElementById('parentOrg').value || null,
        description: document.getElementById('orgDescription').value
    };
    store.addOrganization(organization);
    this.reset();
    alert('组织信息保存成功！');
});

// 添加拖拽初始化函数
function initDragAndDrop() {
    const draggablePersons = document.querySelectorAll('.draggable-person');
    const eventDescription = document.getElementById('eventDescription');
    
    draggablePersons.forEach(person => {
        person.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.textContent);
            e.dataTransfer.setData('application/person-id', this.dataset.personId);
        });
    });
    
    eventDescription.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#4299e1';
    });
    
    eventDescription.addEventListener('dragleave', function(e) {
        this.style.borderColor = '#e2e8f0';
    });
    
    eventDescription.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#e2e8f0';
        
        const personName = e.dataTransfer.getData('text/plain').trim();
        const personId = e.dataTransfer.getData('application/person-id');
        
        // 在光标位置插入人员标签
        const cursorPosition = this.selectionStart;
        const currentValue = this.value;
        const beforeCursor = currentValue.slice(0, cursorPosition);
        const afterCursor = currentValue.slice(cursorPosition);
        
        // 处理前后文本，确保格式正确
        const needSpaceBefore = beforeCursor.length > 0 && 
                               !beforeCursor.endsWith(' ') && 
                               !beforeCursor.endsWith('\n');
        const needSpaceAfter = afterCursor.length > 0 && 
                              !afterCursor.startsWith(' ') && 
                              !afterCursor.startsWith('\n');
        
        // 构建要插入的文本
        const insertText = (needSpaceBefore ? ' ' : '') + 
                          personName + 
                          (needSpaceAfter ? ' ' : '');
        
        // 更新文本框内容
        this.value = beforeCursor + insertText + afterCursor;
        
        // 更新光标位置到插入文本之后
        const newPosition = cursorPosition + insertText.length;
        this.selectionStart = this.selectionEnd = newPosition;
        this.focus();
    });
}

// 修改事件模态框显示函数，确保正确处理日期时间格式
function showEventModal(id = null) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.querySelector('.modal-body');
    
    modalTitle.textContent = id ? '编辑事件' : '添加事件';
    
    // 获取所有人员用于选择
    const people = store.getPeople();
    
    modalBody.innerHTML = `
        <form id="eventManageForm" ${id ? `data-edit-id="${id}"` : ''}>
            <div class="form-row">
                <label for="eventTitle">事件标题</label>
                <input type="text" id="eventTitle" class="form-input" 
                       placeholder="请输入事件标题" required>
            </div>
            
            <div class="form-row">
                <label>可选人员</label>
                <div class="person-list" id="availablePersons">
                    ${people.map(person => `
                        <span class="draggable-person" draggable="true" data-person-id="${person.id}">
                            ${person.name}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-row">
                <label for="eventDescription">事件描述</label>
                <div class="event-description-area">
                    <textarea id="eventDescription" 
                             placeholder="请输入事件描述，可以拖拽上方人员到此处..." 
                             required></textarea>
                </div>
            </div>
            
            <div class="form-row">
                <label>事件时间</label>
                <div class="time-fields">
                    <div class="time-field">
                        <input type="datetime-local" id="startDateTime" class="form-input" required>
                        <span class="time-caption">开始时间</span>
                    </div>
                    <div class="time-separator">至</div>
                    <div class="time-field">
                        <input type="datetime-local" id="endDateTime" class="form-input" required>
                        <span class="time-caption">结束时间</span>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-submit">保存</button>
            </div>
        </form>
    `;
    
    // 初始化拖拽功能
    initDragAndDrop();
    
    // 如果是编辑模式，填充现有数据
    if (id) {
        const event = store.getEvents().find(e => e.id === id);
        if (event) {
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description;
            // 处理日期时间格式
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            document.getElementById('startDateTime').value = startDate.toISOString().slice(0, 16);
            document.getElementById('endDateTime').value = endDate.toISOString().slice(0, 16);
        }
    }
    
    // 修改表单提交事件监听器
    document.getElementById('eventManageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const event = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            startDate: document.getElementById('startDateTime').value,
            endDate: document.getElementById('endDateTime').value,
            // 从描述中提取相关人员
            relatedPersons: getRelatedPersonsFromDescription(document.getElementById('eventDescription').value)
        };
        
        const editId = this.dataset.editId;
        if (editId) {
            store.updateEvent(editId, event);
        } else {
            store.addEvent(event);
        }
        closeModal();
        refreshDataTable('event');
        alert(editId ? '更新成功！' : '添加成功！');
    });
    
    modal.classList.add('active');
}

// 编辑事件
function editEvent(id) {
    showEventModal(id);
}

// 删除事件
function deleteEvent(id) {
    if (confirm('确定要删除这条事件记录吗？')) {
        store.deleteEvent(id);
        refreshDataTable('event');
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
}

// 修改渲染关系网络图函数
function renderRelationshipGraph(container, config) {
    if (!container || !config) {
        console.error('无效的容器或配置');
        return;
    }

    // 清除容器内容
    container.innerHTML = '';
    
    // 创建新的图表实例
    try {
        const graph = new G6.Graph({
            container: container,
            ...config,
            width: container.offsetWidth,
            height: 400,
            // 添加默认配置
            modes: {
                default: ['drag-canvas', 'zoom-canvas', 'drag-node']
            },
            defaultNode: {
                type: 'circle',
                size: 30,
                style: {
                    fill: '#91d5ff',
                    stroke: '#40a9ff'
                }
            },
            defaultEdge: {
                type: 'line',
                style: {
                    stroke: '#91d5ff'
                }
            }
        });

        // 保存图表实例到容器的属性中
        container._graph = graph;

        // 渲染图表
        graph.data(config.data);
        graph.render();

        // 添加自适应大小的处理
        const resizeHandler = () => {
            if (graph && !graph.destroyed) {
                graph.changeSize(container.offsetWidth, 400);
            }
        };
        window.removeEventListener('resize', container._resizeHandler);
        window.addEventListener('resize', resizeHandler);
        container._resizeHandler = resizeHandler;

    } catch (error) {
        console.error('渲染图表失败:', error);
        container.innerHTML = '图表渲染失败';
    }
}

// 修改生成关系网络图函数
async function generateRelationshipGraph() {
    const container = document.getElementById('relationshipGraph');
    
    // 清理旧的图表实例
    if (container._graph) {
        try {
            container._graph.destroy();
            container._graph = null;
        } catch (error) {
            console.error('清理旧图表失败:', error);
        }
    }
    
    // 移除旧的resize监听器
    if (container._resizeHandler) {
        window.removeEventListener('resize', container._resizeHandler);
        container._resizeHandler = null;
    }

    container.innerHTML = '生成中...';
    
    try {
        // 准备人物数据
        const people = store.getPeople();
        const organizations = store.getOrganizations();
        
        // 构造提示词
        const requestBody = {
            model: window.apiConfig.model,
            messages: [
                {
                    role: "system",
                    content: `你是一个专业的组织关系分析专家和数据可视化专家。请根据输入的人物和组织信息，生成一个G6关系图的配置。请只返回JSON格式的配置对象，不要包含任何其他标记或说明。`
                },
                {
                    role: "user",
                    content: `基于以下数据生成G6图配置：
                    人物数据：${JSON.stringify(people, null, 2)}
                    组织数据：${JSON.stringify(organizations, null, 2)}
                    
                    要求：
                    1. 节点表示人物，节点大小反映影响力
                    2. 节点颜色区分部门
                    3. 边表示人物关系
                    4. 需包含完整的布局配置
                    
                    请直接返回配置对象，格式如下：
                    {
                        "width": 800,
                        "height": 600,
                        "modes": {"default": ["drag-canvas", "zoom-canvas", "drag-node"]},
                        "layout": {"type": "force"},
                        "defaultNode": {"type": "circle"},
                        "defaultEdge": {"type": "line"},
                        "data": {
                            "nodes": [],
                            "edges": []
                        }
                    }`
                }
            ],
            stream: false,
            max_tokens: window.apiConfig.max_tokens,
            temperature: window.apiConfig.temperature
        };

        // 调用API
        const response = await fetch(window.apiConfig.url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${window.apiConfig.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const result = await response.json();
        let graphConfig;
        
        try {
            // 尝试清理返回的内容，移除可能的markdown标记
            let content = result.choices[0].message.content;
            content = content.replace(/```json\n?/, '').replace(/```\n?/, '');
            graphConfig = JSON.parse(content.trim());
        } catch (parseError) {
            console.error('解析图表配置失败:', parseError);
            throw new Error('图表配置格式错误');
        }
        
        // 保存图表配置
        store.saveChartData('relationshipGraph', graphConfig);
        
        // 渲染图表
        renderRelationshipGraph(container, graphConfig);
    } catch (error) {
        console.error('生成关系网络图失败:', error);
        container.innerHTML = '生成图表失败，请重试';
    }
}

// 类似地修改其他图表函数
async function generateEventTimeline() {
    const container = document.getElementById('eventTimeline');
    container.innerHTML = '生成中...';
    
    try {
        const events = store.getEvents();
        
        const requestBody = {
            model: window.apiConfig.model,
            messages: [
                {
                    role: "system",
                    content: `你是一个专业的事件分析专家。请根据输入的事件信息生成Mermaid时间线图代码。请确保生成的代码符合Mermaid语法规范。`
                },
                {
                    role: "user",
                    content: `这是事件数据：${JSON.stringify(events, null, 2)}
                    
                    请生成一个Mermaid gantt图的代码，要求：
                    1. 使用 gantt 语法
                    2. dateFormat 使用 YYYY-MM-DD
                    3. 不要使用 active 状态
                    4. 每个事件占一行
                    5. 直接输出图表代码，不要任何说明，不允许换行
                    5. 示例格式：
gantt
    title 智能客服系统开发计划
    dateFormat  YYYY-MM-DD
    section 需求阶段
    市场调研            :2024-03-01, 10d
    需求分析            :2024-03-11, 12d
    需求评审            :2024-03-23, 3d

    section 设计阶段
    系统架构设计        :2024-03-26, 8d
    交互原型设计        :2024-03-26, 10d
    数据库设计          :2024-04-05, 5d

    section 开发阶段
    核心模块开发        :2024-04-10, 15d
    自然语言处理接口    :2024-04-10, 18d
    用户界面开发        :2024-04-15, 12d

    section 测试阶段
    单元测试            :2024-04-27, 7d
    集成测试            :2024-05-04, 10d
    性能优化            :2024-05-14, 8d

    section 部署上线
    用户培训            :2024-05-22, 5d
    生产环境部署        :2024-05-27, 3d
    正式上线            :2024-05-30, 2d`
                }
            ],
            stream: false,
            max_tokens: window.apiConfig.max_tokens,
            temperature: window.apiConfig.temperature
        };

        const response = await fetch(window.apiConfig.url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${window.apiConfig.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const result = await response.json();
        let mermaidCode = result.choices[0].message.content;
        
        // 清理代码，移除可能的markdown标记
        mermaidCode = mermaidCode.replace(/```mermaid\n?/, '').replace(/```\n?/, '').trim();
        
        // 保存图表配置
        store.saveChartData('eventTimeline', mermaidCode);
        
        // 渲染图表
        await renderEventTimeline(container, mermaidCode);
    } catch (error) {
        console.error('生成事件时间线失败:', error);
        container.innerHTML = '生成图表失败，请重试';
    }
}

async function renderEventTimeline(container, code) {
    if (!code) return;
    
    const { svg } = await mermaid.render('eventTimelineChart', code);
    container.innerHTML = svg;
}

// 生成影响力排名图
async function generateInfluenceChart() {
    const container = document.getElementById('influenceChart');
    container.innerHTML = '生成中...';
    
    try {
        const people = store.getPeople();
        
        const requestBody = {
            model: window.apiConfig.model,
            messages: [
                {
                    role: "system",
                    content: `你是一个专业的影响力分析专家。请根据输入的人物信息计算影响力得分并生成排名图表配置。请只返回JSON格式的配置对象，不要包含任何其他标记或说明。`
                },
                {
                    role: "user",
                    content: `基于以下人物数据生成影响力排名：
                    ${JSON.stringify(people, null, 2)}
                    
                    要求：
                    1. 根据职位、权力描述、关系网络计算综合影响力得分(0-100)
                    2. 生成横向条形图，按得分从高到低排序
                    3. 使用不同颜色区分部门
                    4. 在条形上显示具体分值
                    
                    请直接返回Chart.js配置对象，格式如下：
                    {
                        "type": "bar",
                        "data": {
                            "labels": ["张三", "李四"],
                            "datasets": [{
                                "data": [85, 75],
                                "backgroundColor": ["#FF6B6B", "#4ECDC4"],
                                "borderColor": ["#FF6B6B", "#4ECDC4"],
                                "borderWidth": 1
                            }]
                        },
                        "options": {
                            "indexAxis": "y",
                            "responsive": true,
                            "plugins": {
                                "title": {
                                    "display": true,
                                    "text": "人物影响力排名"
                                },
                                "legend": {
                                    "display": false
                                }
                            },
                            "scales": {
                                "x": {
                                    "beginAtZero": true,
                                    "max": 100
                                }
                            }
                        }
                    }`
                }
            ],
            stream: false,
            max_tokens: window.apiConfig.max_tokens,
            temperature: window.apiConfig.temperature
        };

        const response = await fetch(window.apiConfig.url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${window.apiConfig.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const result = await response.json();
        let chartConfig;
        
        try {
            let content = result.choices[0].message.content;
            content = content.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
            chartConfig = JSON.parse(content.trim());
        } catch (parseError) {
            console.error('解析图表配置失败:', parseError);
            throw new Error('图表配置格式错误');
        }
        
        // 保存图表配置
        store.saveChartData('influenceChart', chartConfig);
        
        // 渲染图表
        renderInfluenceChart(container, chartConfig);
        
    } catch (error) {
        console.error('生成影响力分析图失败:', error);
        container.innerHTML = '生成图表失败，请重试';
    }
}

// 添加渲染影响力图表函数
function renderInfluenceChart(container, config) {
    if (!config) return;
    
    // 清除可能存在的旧图表实例
    if (container._chartInstance) {
        container._chartInstance.destroy();
    }
    container.innerHTML = '';
    
    const ctx = document.createElement('canvas');
    container.appendChild(ctx);
    
    // 设置画布大小
    ctx.style.width = '100%';
    ctx.style.height = '400px';
    
    // 创建新图表实例并保存引用
    container._chartInstance = new Chart(ctx, config);
}

// 工具函数
function getColorByDepartment(department) {
    const colors = {
        '总经办': '#FF6B6B',
        '人力资源': '#4ECDC4',
        '财务部': '#45B7D1',
        '技术部': '#96CEB4',
        '市场部': '#FFEEAD'
    };
    return colors[department] || '#CCCCCC';
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化事件监听器
    initializeEventListeners();
    
    // 显示默认页面（人物管理）
    showForm('person');

    // 修改业务搜索功能，将其移到 DOMContentLoaded 事件中
    const businessSearch = document.getElementById('businessSearch');
    if (businessSearch) {
        businessSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const tbody = document.getElementById('businessTableBody');
            if (tbody) {
                const rows = tbody.getElementsByTagName('tr');
                Array.from(rows).forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    }
});

// 初始化所有事件监听器
function initializeEventListeners() {
    // 表单提交处理
    const forms = {
        'personManageForm': handlePersonFormSubmit,
        'organizationManageForm': handleOrganizationFormSubmit,
        'eventManageForm': handleEventFormSubmit,
        'businessManageForm': handleBusinessFormSubmit
    };

    Object.entries(forms).forEach(([formId, handler]) => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', handler);
        }
    });
}

// 新的添加/编辑人物模态框UI
function showPersonModal(id = null) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.querySelector('.modal-body');
    
    modalTitle.textContent = id ? '编辑人物' : '添加人物';
    
    // 获取所有组织作为部门选项
    const organizations = store.getOrganizations();
    
    modalBody.innerHTML = `
        <form id="personManageForm" ${id ? `data-edit-id="${id}"` : ''}>
            <div class="form-row">
                <label for="personName">姓名</label>
                <input type="text" id="personName" class="form-input" placeholder="请输入姓名" required>
            </div>
            <div class="form-row">
                <label for="departmentSelect">部门</label>
                <select id="departmentSelect" class="form-input" onchange="handleDepartmentChange()">
                    <option value="">请选择部门</option>
                    ${organizations.map(org => 
                        `<option value="${org.name}">${org.name}</option>`
                    ).join('')}
                    <option value="other">其他</option>
                </select>
            </div>
            <div class="form-row" id="otherDepartmentRow" style="display: none;">
                <label for="department">其他部门说明</label>
                <input type="text" id="department" class="form-input" placeholder="请输入部门名称">
            </div>
            <div class="form-row">
                <label for="position">职位</label>
                <input type="text" id="position" class="form-input" placeholder="请输入职位" required>
            </div>
            <div class="form-row">
                <label for="power">能力描述</label>
                <textarea id="power" class="form-input" rows="2" placeholder="请描述能力" required></textarea>
            </div>
            <div class="form-row">
                <label for="relationships">人物关系</label>
                <textarea id="relationships" class="form-input" rows="2" placeholder="请输入相关关系" required></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-submit">保存</button>
            </div>
        </form>
    `;
    
    if (id) {
        const person = store.getPeople().find(p => p.id === id);
        if (person) {
            document.getElementById('personName').value = person.name;
            // 设置部门选择
            const departmentSelect = document.getElementById('departmentSelect');
            if (organizations.some(org => org.name === person.department)) {
                departmentSelect.value = person.department;
            } else {
                departmentSelect.value = 'other';
                document.getElementById('otherDepartmentRow').style.display = 'block';
                document.getElementById('department').value = person.department;
            }
            document.getElementById('position').value = person.position;
            document.getElementById('power').value = person.power;
            document.getElementById('relationships').value = person.relationships;
        }
    }
    
    document.getElementById('personManageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const departmentSelect = document.getElementById('departmentSelect');
        const department = departmentSelect.value === 'other' 
            ? document.getElementById('department').value 
            : departmentSelect.value;
            
        if (!department) {
            alert('请选择或输入部门！');
            return;
        }
        
        const person = {
            name: document.getElementById('personName').value,
            department: department,
            position: document.getElementById('position').value,
            power: document.getElementById('power').value,
            relationships: document.getElementById('relationships').value
        };
        
        const editId = this.dataset.editId;
        if (editId) {
            store.updatePerson(editId, person);
        } else {
            store.addPerson(person);
        }
        closeModal();
        refreshDataTable('person');
        alert(editId ? '更新成功！' : '添加成功！');
    });
    
    modal.classList.add('active');
}

// 处理部门选择变化
function handleDepartmentChange() {
    const departmentSelect = document.getElementById('departmentSelect');
    const otherDepartmentRow = document.getElementById('otherDepartmentRow');
    const departmentInput = document.getElementById('department');
    
    if (departmentSelect.value === 'other') {
        otherDepartmentRow.style.display = 'block';
        departmentInput.required = true;
    } else {
        otherDepartmentRow.style.display = 'none';
        departmentInput.required = false;
    }
}

// 显示组织模态框
function showOrganizationModal(id = null) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.querySelector('.modal-body');
    
    modalTitle.textContent = id ? '编辑组织' : '添加组织';
    
    modalBody.innerHTML = `
        <form id="organizationManageForm" ${id ? `data-edit-id="${id}"` : ''}>
            <div class="form-row">
                <label for="orgName">组织名称</label>
                <input type="text" id="orgName" class="form-input" placeholder="请输入组织名称" required>
            </div>
            <div class="form-row">
                <label for="orgType">组织类型</label>
                <select id="orgType" class="form-input" required>
                    <option value="">请选择组织类型</option>
                    <option value="管理部门">管理部门</option>
                    <option value="业务部门">业务部门</option>
                    <option value="职能部门">职能部门</option>
                    <option value="临时项目组">临时项目组</option>
                </select>
            </div>
            <div class="form-row">
                <label for="parentOrg">上级组织</label>
                <select id="parentOrg" class="form-input">
                    <option value="">无上级组织</option>
                    ${store.getOrganizations().map(org => 
                        `<option value="${org.id}">${org.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-row">
                <label for="orgDescription">组织描述</label>
                <textarea id="orgDescription" class="form-input" 
                    rows="4" placeholder="请输入组织描述..." required></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-submit">保存</button>
            </div>
        </form>
    `;
    
    if (id) {
        const org = store.getOrganizations().find(o => o.id === id);
        if (org) {
            document.getElementById('orgName').value = org.name;
            document.getElementById('orgType').value = org.type;
            document.getElementById('parentOrg').value = org.parentId || '';
            document.getElementById('orgDescription').value = org.description;
        }
    }
    
    // 表单提交处理
    document.getElementById('organizationManageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const organization = {
            name: document.getElementById('orgName').value,
            type: document.getElementById('orgType').value,
            parentId: document.getElementById('parentOrg').value || null,
            description: document.getElementById('orgDescription').value
        };
        
        const editId = this.dataset.editId;
        if (editId) {
            store.updateOrganization(editId, organization);
        } else {
            store.addOrganization(organization);
        }
        closeModal();
        refreshDataTable('organization');
        alert(editId ? '更新成功！' : '添加成功！');
    });
    
    modal.classList.add('active');
}

// 编辑组织
function editOrganization(id) {
    showOrganizationModal(id);
}

// 删除组织
function deleteOrganization(id) {
    // 检查是否有下级组织
    const hasChildren = store.getOrganizations().some(org => org.parentId === id);
    if (hasChildren) {
        alert('该组织下还有下级组织，无法删除！');
        return;
    }
    
    // 检查是否有关联人员
    const hasPeople = store.getPeople().some(person => person.organizationId === id);
    if (hasPeople) {
        alert('该组织下还有人员，无法删除！');
        return;
    }
    
    if (confirm('确定要删除这个组织吗？')) {
        store.deleteOrganization(id);
        refreshDataTable('organization');
    }
}

// 显示业务模态框
function showBusinessModal(id = null) {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.querySelector('.modal-body');
    
    modalTitle.textContent = id ? '编辑业务' : '添加业务';
    
    // 获取所有部门用于下拉选择
    const departments = store.getOrganizations();
    
    modalBody.innerHTML = `
        <form id="businessManageForm" ${id ? `data-edit-id="${id}"` : ''}>
            <div class="form-row">
                <label for="businessName">业务名称</label>
                <input type="text" id="businessName" class="form-input" 
                       placeholder="请输入业务名称" required>
            </div>
            <div class="form-row">
                <label for="businessType">业务类型</label>
                <select id="businessType" class="form-input" required>
                    <option value="">请选择业务类型</option>
                    <option value="主营业务">主营业务</option>
                    <option value="支持业务">支持业务</option>
                    <option value="创新业务">创新业务</option>
                </select>
            </div>
            <div class="form-row">
                <label for="departmentId">负责部门</label>
                <select id="departmentId" class="form-input" required>
                    <option value="">请选择负责部门</option>
                    ${departments.map(dept => 
                        `<option value="${dept.id}">${dept.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-row">
                <label for="businessDescription">业务描述</label>
                <textarea id="businessDescription" class="form-input" 
                         rows="4" placeholder="请输入业务描述..." required></textarea>
            </div>
            <div class="form-row">
                <label for="businessStatus">业务状态</label>
                <select id="businessStatus" class="form-input" required>
                    <option value="筹备中">筹备中</option>
                    <option value="运营中">运营中</option>
                    <option value="已暂停">已暂停</option>
                    <option value="已终止">已终止</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">取消</button>
                <button type="submit" class="btn-submit">保存</button>
            </div>
        </form>
    `;
    
    if (id) {
        const business = store.getBusinesses().find(b => b.id === id);
        if (business) {
            document.getElementById('businessName').value = business.name;
            document.getElementById('businessType').value = business.type;
            document.getElementById('departmentId').value = business.departmentId;
            document.getElementById('businessDescription').value = business.description;
            document.getElementById('businessStatus').value = business.status;
        }
    }
    
    // 表单提交处理
    document.getElementById('businessManageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const business = {
            name: document.getElementById('businessName').value,
            type: document.getElementById('businessType').value,
            departmentId: document.getElementById('departmentId').value,
            description: document.getElementById('businessDescription').value,
            status: document.getElementById('businessStatus').value
        };
        
        const editId = this.dataset.editId;
        if (editId) {
            store.updateBusiness(editId, business);
        } else {
            store.addBusiness(business);
        }
        closeModal();
        refreshDataTable('business');
        alert(editId ? '更新成功！' : '添加成功！');
    });
    
    modal.classList.add('active');
}

// 编辑业务
function editBusiness(id) {
    showBusinessModal(id);
}

// 删除业务
function deleteBusiness(id) {
    if (confirm('确定要删除这条业务记录吗？')) {
        store.deleteBusiness(id);
        refreshDataTable('business');
    }
}

// 更新统计数据
function updateDashboardStats() {
    document.getElementById('totalPeople').textContent = store.getPeople().length;
    document.getElementById('totalOrgs').textContent = store.getOrganizations().length;
    document.getElementById('totalBusiness').textContent = store.getBusinesses().length;
    document.getElementById('totalEvents').textContent = store.getEvents().length;
}

// 修改初始化仪表板函数
function initDashboard() {
    updateDashboardStats();
    
    // 获取容器元素
    const relationshipGraphContainer = document.getElementById('relationshipGraph');
    const eventTimelineContainer = document.getElementById('eventTimeline');
    const influenceChartContainer = document.getElementById('influenceChart');
    
    // 确保所有容器都存在
    if (!relationshipGraphContainer || !eventTimelineContainer || !influenceChartContainer) {
        console.error('找不到图表容器元素');
        return;
    }
    
    // 清理所有容器中可能存在的旧图表实例
    [relationshipGraphContainer, eventTimelineContainer, influenceChartContainer].forEach(container => {
        if (container._graph) {
            try {
                container._graph.destroy();
                container._graph = null;
            } catch (error) {
                console.error('清理旧图表失败:', error);
            }
        }
        if (container._resizeHandler) {
            window.removeEventListener('resize', container._resizeHandler);
            container._resizeHandler = null;
        }
    });
    
    // 尝试恢复已保存的图表数据
    const relationshipData = store.getChartData('relationshipGraph');
    const eventTimelineData = store.getChartData('eventTimeline');
    const influenceChartData = store.getChartData('influenceChart');
    
    // 渲染关系网络图
    if (relationshipData) {
        try {
            renderRelationshipGraph(relationshipGraphContainer, relationshipData);
        } catch (error) {
            console.error('渲染关系网络图失败:', error);
            relationshipGraphContainer.innerHTML = `
                <button onclick="generateRelationshipGraph()" class="btn-chart-action">
                    <span class="action-icon">🔄</span>
                    <span class="action-text">更新数据</span>
                </button>
            `;
        }
    } else {
        relationshipGraphContainer.innerHTML = `
            <button onclick="generateRelationshipGraph()" class="btn-chart-action">
                <span class="action-icon">🔄</span>
                <span class="action-text">更新数据</span>
            </button>
        `;
    }
    
    // 渲染事件时间线
    if (eventTimelineData) {
        try {
            renderEventTimeline(eventTimelineContainer, eventTimelineData);
        } catch (error) {
            console.error('渲染事件时间线失败:', error);
            eventTimelineContainer.innerHTML = `
                <button onclick="generateEventTimeline()" class="btn-chart-action">
                    <span class="action-icon">🔄</span>
                    <span class="action-text">更新数据</span>
                </button>
            `;
        }
    } else {
        eventTimelineContainer.innerHTML = `
            <button onclick="generateEventTimeline()" class="btn-chart-action">
                <span class="action-icon">🔄</span>
                <span class="action-text">更新数据</span>
            </button>
        `;
    }
    
    // 渲染影响力图表
    if (influenceChartData) {
        try {
            renderInfluenceChart(influenceChartContainer, influenceChartData);
        } catch (error) {
            console.error('渲染影响力图表失败:', error);
            influenceChartContainer.innerHTML = `
                <button onclick="generateInfluenceChart()" class="btn-chart-action">
                    <span class="action-icon">🔄</span>
                    <span class="action-text">更新数据</span>
                </button>
            `;
        }
    } else {
        influenceChartContainer.innerHTML = `
            <button onclick="generateInfluenceChart()" class="btn-chart-action">
                <span class="action-icon">🔄</span>
                <span class="action-text">更新数据</span>
            </button>
        `;
    }
}

// 显示政治分析器
function showPoliticsAnalyzer() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    document.getElementById('politicsAnalyzerSection').style.display = 'block';
    
    // 加载事件列表
    loadEventsList();
    
    // 初始加载所有人物列表
    const people = store.getPeople();
    const peopleList = document.getElementById('peopleList');
    peopleList.innerHTML = people.map(person => `
        <div class="person-item" data-id="${person.id}">
            ${person.name}
        </div>
    `).join('');
    
    // 恢复已保存的选择状态
    restoreSavedSelections();
    
    // 恢复已保存的分析结果
    restoreSavedAnalysisResults();
}

// 恢复已保存的选择状态
function restoreSavedSelections() {
    const politicsData = store.getPoliticsAnalysisData();
    if (!politicsData) return;
    
    const { selectedEvents, selectedPeople } = politicsData;
    
    // 恢复选中的事件
    if (selectedEvents && selectedEvents.length > 0) {
        selectedEvents.forEach(eventId => {
            const eventElement = document.querySelector(`.event-item[data-id="${eventId}"]`);
            if (eventElement) {
                eventElement.classList.add('selected');
            }
        });
        
        // 更新人物列表以匹配选中的事件
        updatePeopleList();
    }
    
    // 恢复选中的人物
    if (selectedPeople && selectedPeople.length > 0) {
        selectedPeople.forEach(personId => {
            const personElement = document.querySelector(`.person-item[data-id="${personId}"]`);
            if (personElement) {
                personElement.classList.add('selected');
            }
        });
    }
}

// 恢复已保存的分析结果
async function restoreSavedAnalysisResults() {
    const politicsData = store.getPoliticsAnalysisData();
    if (!politicsData) return;
    
    const { motivationChart, tacticsChart, impactChart } = politicsData;
    
    // 如果有保存的图表数据，则渲染它们
    if (motivationChart || tacticsChart || impactChart) {
        const charts = [
            { id: 'motivationChart', code: motivationChart },
            { id: 'tacticsChart', code: tacticsChart },
            { id: 'impactChart', code: impactChart }
        ];
        
        for (const chart of charts) {
            if (chart.code) {
                const container = document.getElementById(chart.id);
                try {
                    const { svg } = await mermaid.render(`${chart.id}-svg`, chart.code);
                    container.innerHTML = svg;
                } catch (error) {
                    console.error(`渲染${chart.id}失败:`, error);
                    container.innerHTML = '图表恢复失败';
                }
            }
        }
    }
}

// 修改开始分析函数
async function startAnalysis() {
    // 首先检查可视化看板的数据是否存在
    const relationshipData = store.getChartData('relationshipGraph');
    const eventTimelineData = store.getChartData('eventTimeline');
    const influenceChartData = store.getChartData('influenceChart');

    if (!relationshipData || !eventTimelineData || !influenceChartData) {
        alert('请先完善可视化看板数据！\n需要生成：\n- 组织关系网络图\n- 事件时间线\n- 人物影响力排名');
        return;
    }

    // 获取选中的事件和人物
    const selectedEventElements = Array.from(document.querySelectorAll('.event-item.selected'));
    const selectedPeopleElements = Array.from(document.querySelectorAll('.person-item.selected'));
    
    const selectedEvents = selectedEventElements
        .map(item => {
            const eventId = item.dataset.id;
            return store.getEvents().find(event => event.id === eventId);
        })
        .filter(event => event);
    
    const selectedPeople = selectedPeopleElements
        .map(item => {
            const personId = item.dataset.id;
            return store.getPeople().find(person => person.id === personId);
        })
        .filter(person => person);
    
    // 保存选中的事件和人物ID
    const selectedEventIds = selectedEventElements.map(item => item.dataset.id);
    const selectedPeopleIds = selectedPeopleElements.map(item => item.dataset.id);
    store.saveSelectedItems(selectedEventIds, selectedPeopleIds);
    
    if (selectedEvents.length === 0 || selectedPeople.length === 0) {
        alert('请至少选择一个事件和一个角色');
        return;
    }

    try {
        // 更新三个图表区域的状态
        ['motivationChart', 'tacticsChart', 'impactChart'].forEach(id => {
            const container = document.getElementById(id);
            container.innerHTML = '分析中...';
        });

        // 构造提示词，加入可视化看板数据作为上下文
        const prompt = `
作为一位组织行为学专家，请基于以下数据进行深入分析：

背景数据：
1. 组织关系网络：${JSON.stringify(relationshipData, null, 2)}
2. 事件时间线：${JSON.stringify(eventTimelineData, null, 2)}
3. 影响力排名：${JSON.stringify(influenceChartData, null, 2)}

分析对象：
- 关键角色：${JSON.stringify(selectedPeople, null, 2)}
- 相关事件：${JSON.stringify(selectedEvents, null, 2)}

请生成三个专业的分析图表：
1. 动机分析图：深入分析关键角色在事件中的核心动机、目标和利益诉求
2. 策略分析图：剖析关键角色在事件中采用的组织行为策略和影响手段
3. 影响链分析图：评估事件对组织关系网络中各方的短期和长期影响

技术要求：
1. 使用 flowchart LR 语法
2. 确保 mermaid 语法准确
3. 直接输出三个图表代码，无需其他说明文字
4. 使用专业的组织行为学术语，保持客观中立的分析视角`;

        const response = await fetch(window.apiConfig.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: window.apiConfig.model,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                stream: window.apiConfig.stream
            })
        });

        if (!response.ok) throw new Error('API请求失败');
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // 从返回内容中提取三个mermaid图表代码
        const mermaidCodes = content.match(/```mermaid([\s\S]*?)```/g)
            .map(code => code.replace(/```mermaid\n?/, '').replace(/```\n?/, '').trim());
        
        // 分别渲染三个图表
        if (mermaidCodes.length >= 3) {
            const charts = [
                { id: 'motivationChart', code: mermaidCodes[0] },
                { id: 'tacticsChart', code: mermaidCodes[1] },
                { id: 'impactChart', code: mermaidCodes[2] }
            ];
            
            // 保存图表代码到store
            store.savePoliticsAnalysisData({
                motivationChart: mermaidCodes[0],
                tacticsChart: mermaidCodes[1],
                impactChart: mermaidCodes[2]
            });
            
            for (const chart of charts) {
                const container = document.getElementById(chart.id);
                try {
                    const { svg } = await mermaid.render(`${chart.id}-svg`, chart.code);
                    container.innerHTML = svg;
                } catch (error) {
                    console.error(`渲染${chart.id}失败:`, error);
                    container.innerHTML = '图表生成失败';
                }
            }
        } else {
            throw new Error('未能生成足够的图表');
        }

    } catch (error) {
        console.error('分析失败:', error);
        ['motivationChart', 'tacticsChart', 'impactChart'].forEach(id => {
            const container = document.getElementById(id);
            container.innerHTML = '分析失败，请重试';
        });
    }
}

// 修改事件和人物选择处理
function initSelectionHandlers() {
    // 事件选择
    document.querySelectorAll('.event-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // 如果没有按住 Control 键，先清除其他选中项
            if (!e.ctrlKey) {
                document.querySelectorAll('.event-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('selected');
                    }
                });
            }
            
            item.classList.toggle('selected');
            updatePeopleList();
            
            // 显示选中事件的预览
            updateEventPreview();
            
            // 保存当前选择状态
            saveCurrentSelections();
        });
    });

    // 人物选择
    document.querySelectorAll('.person-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            
            // 保存当前选择状态
            saveCurrentSelections();
        });
    });
}

// 保存当前选择状态
function saveCurrentSelections() {
    const selectedEventIds = Array.from(document.querySelectorAll('.event-item.selected'))
        .map(item => item.dataset.id);
    
    const selectedPeopleIds = Array.from(document.querySelectorAll('.person-item.selected'))
        .map(item => item.dataset.id);
    
    store.saveSelectedItems(selectedEventIds, selectedPeopleIds);
}

// 修改加载事件列表的函数
function loadEventsList() {
    const eventsList = document.getElementById('eventsList');
    const events = store.getEvents();
    
    eventsList.innerHTML = events.map(event => `
        <div class="event-item" data-id="${event.id}">
            ${event.title}
        </div>
    `).join('');
    
    initSelectionHandlers();
    
    // 初始化事件预览监听器
    initEventPreviewListener();
}

function loadPeopleList() {
    const peopleList = document.getElementById('peopleList');
    // 从 store 获取人物数据
    const people = store.getPeople();
    
    peopleList.innerHTML = people.map(person => `
        <div class="person-item" data-id="${person.id}">
            ${person.name}
        </div>
    `).join('');
    
    initSelectionHandlers();
}

// 添加显示历史记录的函数
function showHistory() {
    // 获取iframe中的historyManager
    const iframe = document.querySelector('#aiChatContent iframe');
    if (iframe && iframe.contentWindow.historyManager) {
        iframe.contentWindow.historyManager.showHistoryPanel();
    }
}

// 修改 sendMessage 函数，使用全局 apiConfig
async function sendMessage() {
    // ... 现有代码 ...
    
    // 使用全局 apiConfig
    const requestBody = {
        model: window.apiConfig.model,
        messages: [
            // 消息格式需要确保兼容
        ],
        stream: window.apiConfig.stream,
        max_tokens: window.apiConfig.max_tokens,
        temperature: window.apiConfig.temperature
    };
    
    // ... 发送请求和处理响应的代码 ...
}

// 根据选中的事件更新人物列表
function updatePeopleList() {
    // 获取所有选中的事件
    const selectedEventElements = document.querySelectorAll('.event-item.selected');
    const selectedEventIds = Array.from(selectedEventElements).map(item => item.dataset.id);
    
    // 如果没有选中的事件，显示所有人物
    if (selectedEventIds.length === 0) {
        loadPeopleList();
        return;
    }
    
    // 获取选中事件相关的人物ID
    const relatedPersonIds = new Set();
    selectedEventIds.forEach(eventId => {
        const event = store.getEvents().find(e => e.id === eventId);
        if (event && event.relatedPersons) {
            event.relatedPersons.forEach(personId => relatedPersonIds.add(personId));
        }
    });
    
    // 获取所有人物
    const people = store.getPeople();
    const peopleList = document.getElementById('peopleList');
    
    // 如果有相关人物，只显示相关人物；否则显示所有人物
    if (relatedPersonIds.size > 0) {
        peopleList.innerHTML = people
            .filter(person => relatedPersonIds.has(person.id))
            .map(person => `
                <div class="person-item" data-id="${person.id}">
                    ${person.name}
                </div>
            `).join('');
    } else {
        // 如果没有找到相关人物，显示所有人物
        peopleList.innerHTML = people.map(person => `
            <div class="person-item" data-id="${person.id}">
                ${person.name}
            </div>
        `).join('');
    }
    
    // 恢复已选中的人物
    const politicsData = store.getPoliticsAnalysisData();
    if (politicsData && politicsData.selectedPeople) {
        politicsData.selectedPeople.forEach(personId => {
            const personElement = document.querySelector(`.person-item[data-id="${personId}"]`);
            if (personElement) {
                personElement.classList.add('selected');
            }
        });
    }
    
    // 重新绑定选择事件
    document.querySelectorAll('.person-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            saveCurrentSelections();
        });
    });
}

// 添加事件预览更新函数
function updateEventPreview() {
    const selectedEventElements = document.querySelectorAll('.event-item.selected');
    const eventPreviewContainer = document.getElementById('eventPreviewContainer');
    const eventPreviewTextarea = document.getElementById('eventPreview');
    
    if (selectedEventElements.length === 0) {
        // 如果没有选中的事件，隐藏预览区域
        eventPreviewContainer.style.display = 'none';
        return;
    }
    
    // 显示预览区域
    eventPreviewContainer.style.display = 'block';
    
    // 如果只选中了一个事件，显示其详细内容
    if (selectedEventElements.length === 1) {
        const eventId = selectedEventElements[0].dataset.id;
        const event = store.getEvents().find(e => e.id === eventId);
        if (event) {
            eventPreviewTextarea.value = event.description || '无事件描述';
        } else {
            eventPreviewTextarea.value = '无法加载事件描述';
        }
    } else {
        // 如果选中了多个事件，显示提示信息
        eventPreviewTextarea.value = `已选择 ${selectedEventElements.length} 个事件，请选择单个事件查看详细内容。`;
    }
}

// 修改事件预览内容变更监听器
function initEventPreviewListener() {
    const eventPreviewTextarea = document.getElementById('eventPreview');
    if (eventPreviewTextarea) {
        eventPreviewTextarea.addEventListener('input', function() {
            // 获取当前选中的事件
            const selectedEventElements = document.querySelectorAll('.event-item.selected');
            if (selectedEventElements.length === 1) {
                const eventId = selectedEventElements[0].dataset.id;
                const event = store.getEvents().find(e => e.id === eventId);
                if (event) {
                    // 从描述中提取相关人员
                    const updatedRelatedPersons = getRelatedPersonsFromDescription(this.value);
                    
                    // 更新事件描述和相关人员
                    store.updateEvent(eventId, {
                        ...event,
                        description: this.value,
                        relatedPersons: updatedRelatedPersons
                    });
                    
                    // 更新人物列表显示
                    updatePeopleList();
                }
            }
        });
    }
}

// 修改从描述中提取相关人员的函数，使其接受描述文本作为参数
function getRelatedPersonsFromDescription(description) {
    const people = store.getPeople();
    const relatedPersons = new Set();
    
    people.forEach(person => {
        if (description.includes(person.name)) {
            relatedPersons.add(person.id);
        }
    });
    
    return Array.from(relatedPersons);
} 
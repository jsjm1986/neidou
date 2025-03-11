class Store {
    constructor() {
        this.people = [];
        this.organizations = [];
        this.businesses = [];
        this.events = [];
        this.chartData = {
            relationshipGraph: null,
            eventTimeline: null,
            influenceChart: null
        };
        // 添加政治分析数据存储
        this.politicsAnalysisData = {
            motivationChart: null,
            tacticsChart: null,
            impactChart: null,
            selectedEvents: [],
            selectedPeople: []
        };
        this.loadData();
    }

    // 加载本地存储的数据
    loadData() {
        try {
            const people = localStorage.getItem('people');
            const organizations = localStorage.getItem('organizations');
            const businesses = localStorage.getItem('businesses');
            const events = localStorage.getItem('events');
            const chartData = localStorage.getItem('chartData');
            // 加载政治分析数据
            const politicsAnalysisData = localStorage.getItem('politicsAnalysisData');

            this.people = people ? JSON.parse(people) : [];
            this.organizations = organizations ? JSON.parse(organizations) : [];
            this.businesses = businesses ? JSON.parse(businesses) : [];
            this.events = events ? JSON.parse(events) : [];
            this.chartData = chartData ? JSON.parse(chartData) : {
                relationshipGraph: null,
                eventTimeline: null,
                influenceChart: null
            };
            // 解析政治分析数据
            this.politicsAnalysisData = politicsAnalysisData ? JSON.parse(politicsAnalysisData) : {
                motivationChart: null,
                tacticsChart: null,
                impactChart: null,
                selectedEvents: [],
                selectedPeople: []
            };
            
            // 如果数据为空，初始化一些示例数据
            if (this.people.length === 0) {
                this.initializeExampleData();
            }

            // 确保数据加载后立即保存，以防示例数据初始化
            this.saveData();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.people = [];
            this.organizations = [];
            this.businesses = [];
            this.events = [];
            this.politicsAnalysisData = {
                motivationChart: null,
                tacticsChart: null,
                impactChart: null,
                selectedEvents: [],
                selectedPeople: []
            };
        }
    }

    // 初始化示例数据
    initializeExampleData() {
        const examplePeople = [
            {
                id: '1',
                name: '张三',
                department: '总经办',
                position: '总经理',
                power: '全面负责公司经营管理，直接管理财务、人事等核心部门，拥有最终决策权',
                relationships: '李四(副总经理)是其大学同学，与王五(财务总监)是连襟关系，与赵六(市场总监)有过合作'
            },
            {
                id: '2',
                name: '李四',
                department: '运营部',
                position: '副总经理',
                power: '分管公司日常运营，对外商务谈判，下辖销售、市场部门，拥有较大决策权',
                relationships: '是张三(总经理)大学同学，与市场部赵六是老乡，与技术部孙七有矛盾'
            },
            {
                id: '3',
                name: '王五',
                department: '财务部',
                position: '财务总监',
                power: '负责公司财务管理、预算控制、资金调配，对财务决策有较大影响力',
                relationships: '与张三(总经理)是连襟关系，与周八(人事总监)关系密切，与李四(副总经理)有分歧'
            },
            {
                id: '4',
                name: '赵六',
                department: '市场部',
                position: '市场总监',
                power: '负责公司市场策略制定、品牌推广、市场调研，对市场决策有较大影响力',
                relationships: '与李四(副总经理)是老乡，与吴九(销售总监)是大学同学，与张三有过合作'
            },
            {
                id: '5',
                name: '孙七',
                department: '技术部',
                position: '技术总监',
                power: '负责公司技术研发、产品开发、技术团队管理，对技术决策有较大影响力',
                relationships: '与李四(副总经理)有矛盾，与郑十(产品经理)关系密切，是公司技术骨干'
            },
            {
                id: '6',
                name: '周八',
                department: '人事部',
                position: '人事总监',
                power: '负责公司人力资源管理、招聘、培训、绩效考核，对人事决策有较大影响力',
                relationships: '与王五(财务总监)关系密切，与张三(总经理)有直接汇报关系'
            },
            {
                id: '7',
                name: '吴九',
                department: '销售部',
                position: '销售总监',
                power: '负责公司销售团队管理、客户关系维护、销售策略制定，对销售决策有较大影响力',
                relationships: '与赵六(市场总监)是大学同学，与李四(副总经理)有直接汇报关系'
            },
            {
                id: '8',
                name: '郑十',
                department: '产品部',
                position: '产品经理',
                power: '负责公司产品规划、需求分析、产品迭代，对产品决策有较大影响力',
                relationships: '与孙七(技术总监)关系密切，与赵六(市场总监)有工作往来'
            }
        ];

        const exampleOrganizations = [
            {
                id: '1',
                name: '总经办',
                type: '管理部门',
                parentId: null,
                description: '公司最高决策机构，负责公司整体战略规划和重大决策，直接管理各职能部门'
            },
            {
                id: '2',
                name: '运营部',
                type: '业务部门',
                parentId: '1',
                description: '负责公司日常运营管理，包括销售、市场等业务线，确保公司业务顺利开展'
            },
            {
                id: '3',
                name: '财务部',
                type: '职能部门',
                parentId: '1',
                description: '负责公司财务管理、预算控制、资金调配，确保公司财务健康运行'
            },
            {
                id: '4',
                name: '市场部',
                type: '业务部门',
                parentId: '2',
                description: '负责公司市场策略制定、品牌推广、市场调研，提升公司品牌影响力'
            },
            {
                id: '5',
                name: '技术部',
                type: '研发部门',
                parentId: '1',
                description: '负责公司技术研发、产品开发、技术团队管理，提供技术支持和创新'
            },
            {
                id: '6',
                name: '人事部',
                type: '职能部门',
                parentId: '1',
                description: '负责公司人力资源管理、招聘、培训、绩效考核，保障人才供应'
            },
            {
                id: '7',
                name: '销售部',
                type: '业务部门',
                parentId: '2',
                description: '负责公司销售团队管理、客户关系维护、销售策略制定，实现销售目标'
            },
            {
                id: '8',
                name: '产品部',
                type: '研发部门',
                parentId: '5',
                description: '负责公司产品规划、需求分析、产品迭代，确保产品符合市场需求'
            }
        ];

        const exampleEvents = [
            {
                id: '1',
                title: '年度战略规划会议',
                description: '讨论公司未来一年的发展战略和重点项目规划，张三主持会议，各部门负责人参加，李四提出了市场扩张计划，王五对财务预算提出了质疑。',
                startDate: '2024-01-15T09:00',
                endDate: '2024-01-15T18:00',
                relatedPersons: ['1', '2', '3', '4', '5', '6', '7', '8']
            },
            {
                id: '2',
                title: '新产品发布会',
                description: '公司新产品正式对外发布，赵六负责市场宣传，孙七介绍技术亮点，郑十展示产品功能，张三致开场词。',
                startDate: '2024-02-20T14:00',
                endDate: '2024-02-20T17:00',
                relatedPersons: ['1', '4', '5', '8']
            },
            {
                id: '3',
                title: '季度财务分析会',
                description: '分析公司第一季度财务状况，王五主持会议并做财务报告，张三对部分数据提出质疑，李四要求增加市场投入。',
                startDate: '2024-04-05T10:00',
                endDate: '2024-04-05T12:00',
                relatedPersons: ['1', '2', '3']
            },
            {
                id: '4',
                title: '技术部与市场部冲突',
                description: '因产品迭代计划，技术部孙七与市场部赵六发生激烈争执，李四出面调解，最终由张三拍板决定延期发布。',
                startDate: '2024-03-10T15:30',
                endDate: '2024-03-10T17:00',
                relatedPersons: ['1', '2', '4', '5']
            },
            {
                id: '5',
                title: '人事变动会议',
                description: '周八提出人事调整方案，涉及多个部门主管，引起部分人员不满，张三最终批准了调整方案。',
                startDate: '2024-05-12T09:30',
                endDate: '2024-05-12T11:30',
                relatedPersons: ['1', '6']
            },
            {
                id: '6',
                title: '大客户签约仪式',
                description: '公司与行业龙头企业签署战略合作协议，吴九负责前期谈判，李四和张三出席签约仪式。',
                startDate: '2024-06-18T14:00',
                endDate: '2024-06-18T16:00',
                relatedPersons: ['1', '2', '7']
            },
            {
                id: '7',
                title: '内部提拔争议',
                description: '销售部一位经理提拔引发争议，吴九与周八意见不合，李四支持吴九，最终张三决定暂缓提拔。',
                startDate: '2024-07-05T16:00',
                endDate: '2024-07-05T17:30',
                relatedPersons: ['1', '2', '6', '7']
            }
        ];

        const exampleBusinesses = [
            {
                id: '1',
                name: '企业咨询服务',
                type: '主营业务',
                departmentId: '2',
                description: '为企业提供战略规划、组织优化等咨询服务，是公司的核心收入来源',
                status: '运营中'
            },
            {
                id: '2',
                name: '人才培训',
                type: '支持业务',
                departmentId: '6',
                description: '提供企业内训、管理培训等服务，支持主营业务发展',
                status: '运营中'
            },
            {
                id: '3',
                name: '数字化转型解决方案',
                type: '主营业务',
                departmentId: '5',
                description: '为传统企业提供数字化转型解决方案，包括系统开发、流程再造等',
                status: '运营中'
            },
            {
                id: '4',
                name: '市场调研服务',
                type: '支持业务',
                departmentId: '4',
                description: '为客户提供市场调研、竞品分析、用户研究等服务',
                status: '运营中'
            },
            {
                id: '5',
                name: '人工智能应用开发',
                type: '创新业务',
                departmentId: '5',
                description: '开发基于人工智能的企业应用，包括智能客服、预测分析等',
                status: '筹备中'
            },
            {
                id: '6',
                name: '国际业务拓展',
                type: '创新业务',
                departmentId: '7',
                description: '拓展海外市场，为国际客户提供本地化服务',
                status: '筹备中'
            },
            {
                id: '7',
                name: '企业内训平台',
                type: '创新业务',
                departmentId: '8',
                description: '开发在线企业培训平台，提供标准化培训课程和定制服务',
                status: '已暂停'
            },
            {
                id: '8',
                name: '管理软件开发',
                type: '主营业务',
                departmentId: '5',
                description: '开发企业管理软件，包括ERP、CRM、OA等系统',
                status: '运营中'
            }
        ];

        this.people = examplePeople;
        this.organizations = exampleOrganizations;
        this.events = exampleEvents;
        this.businesses = exampleBusinesses;
    }

    // 保存数据到本地存储
    saveData() {
        try {
            const safeChartData = this.removeCircularReferences(this.chartData);
            const safePoliticsData = this.removeCircularReferences(this.politicsAnalysisData);
            
            localStorage.setItem('people', JSON.stringify(this.people));
            localStorage.setItem('organizations', JSON.stringify(this.organizations));
            localStorage.setItem('businesses', JSON.stringify(this.businesses));
            localStorage.setItem('events', JSON.stringify(this.events));
            localStorage.setItem('chartData', JSON.stringify(safeChartData));
            localStorage.setItem('politicsAnalysisData', JSON.stringify(safePoliticsData));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    // 人物相关方法
    addPerson(person) {
        this.people.push({
            id: Date.now().toString(),
            ...person
        });
        this.saveData();
    }

    updatePerson(id, updatedPerson) {
        const index = this.people.findIndex(p => p.id === id);
        if (index !== -1) {
            this.people[index] = { ...this.people[index], ...updatedPerson };
            this.saveData();
        }
    }

    deletePerson(id) {
        this.people = this.people.filter(p => p.id !== id);
        this.saveData();
    }

    // 组织相关方法
    addOrganization(organization) {
        const newOrg = {
            id: Date.now().toString(),
            ...organization,
            createdAt: new Date().toISOString()
        };
        this.organizations.push(newOrg);
        this.saveData();
        return newOrg;
    }

    updateOrganization(id, updatedOrg) {
        const index = this.organizations.findIndex(o => o.id === id);
        if (index !== -1) {
            this.organizations[index] = {
                ...this.organizations[index],
                ...updatedOrg,
                id,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
        }
    }

    deleteOrganization(id) {
        this.organizations = this.organizations.filter(o => o.id !== id);
        this.saveData();
    }

    getOrganizationById(id) {
        return this.organizations.find(o => o.id === id);
    }

    getOrganizationsByParentId(parentId) {
        return this.organizations.filter(o => o.parentId === parentId);
    }

    getOrganizationHierarchy() {
        const buildHierarchy = (parentId = null) => {
            return this.organizations
                .filter(org => org.parentId === parentId)
                .map(org => ({
                    ...org,
                    children: buildHierarchy(org.id)
                }));
        };
        
        return buildHierarchy();
    }

    // 事件相关方法
    addEvent(event) {
        const newEvent = {
            id: Date.now().toString(),
            ...event,
            // 确保时间格式正确
            startDate: new Date(event.startDate).toISOString(),
            endDate: new Date(event.endDate).toISOString(),
            relatedPersons: event.relatedPersons || []
        };
        this.events.push(newEvent);
        this.saveData();
    }

    updateEvent(id, updatedEvent) {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = {
                ...this.events[index],
                ...updatedEvent,
                // 确保时间格式正确
                startDate: new Date(updatedEvent.startDate).toISOString(),
                endDate: new Date(updatedEvent.endDate).toISOString(),
                relatedPersons: updatedEvent.relatedPersons || [],
                id // 保留原始id
            };
            this.saveData();
        }
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveData();
    }

    // 业务相关方法
    addBusiness(business) {
        const newBusiness = {
            id: Date.now().toString(),
            ...business,
            createdAt: new Date().toISOString()
        };
        this.businesses.push(newBusiness);
        this.saveData();
        return newBusiness;
    }

    updateBusiness(id, updatedBusiness) {
        const index = this.businesses.findIndex(b => b.id === id);
        if (index !== -1) {
            this.businesses[index] = {
                ...this.businesses[index],
                ...updatedBusiness,
                id,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
        }
    }

    deleteBusiness(id) {
        this.businesses = this.businesses.filter(b => b.id !== id);
        this.saveData();
    }

    // 获取数据方法
    getPeople() {
        return this.people;
    }

    getOrganizations() {
        return this.organizations;
    }

    getEvents() {
        return this.events;
    }

    getBusinesses() {
        return this.businesses;
    }

    // 添加图表数据相关方法
    saveChartData(type, data) {
        try {
            // 在保存前处理循环引用
            const safeData = this.removeCircularReferences(data);
            this.chartData[type] = safeData;
            this.saveData();
        } catch (error) {
            console.error('保存图表数据失败:', error);
        }
    }

    getChartData(type) {
        return this.chartData[type];
    }

    clearChartData(type) {
        this.chartData[type] = null;
        this.saveData();
    }

    // 添加处理循环引用的方法
    removeCircularReferences(obj) {
        const seen = new WeakSet();
        
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (key === 'parent' || key === 'children') {
                return undefined; // 移除可能导致循环引用的属性
            }
            
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return undefined;
                }
                seen.add(value);
            }
            return value;
        }));
    }

    // 添加获取数据的方法
    getRelationshipData() {
        // 构建组织关系网络数据
        const relationships = {
            nodes: [],
            links: []
        };

        // 添加组织节点
        this.organizations.forEach(org => {
            relationships.nodes.push({
                id: org.id,
                name: org.name,
                type: 'organization'
            });
        });

        // 添加人员节点
        this.people.forEach(person => {
            relationships.nodes.push({
                id: person.id,
                name: person.name,
                type: 'person'
            });
        });

        // 添加组织间的关系
        this.organizations.forEach(org => {
            if (org.parentId) {
                relationships.links.push({
                    source: org.parentId,
                    target: org.id,
                    type: 'reports_to'
                });
            }
        });

        // 添加人员与组织的关系
        this.people.forEach(person => {
            if (person.department) {
                const dept = this.organizations.find(org => org.name === person.department);
                if (dept) {
                    relationships.links.push({
                        source: person.id,
                        target: dept.id,
                        type: 'belongs_to'
                    });
                }
            }
        });

        return relationships;
    }
    
    getEventTimeline() {
        // 返回事件时间线数据
        return this.events || [];
    }
    
    getInfluenceData() {
        if (!this.people) return [];
        
        // 计算每个人的影响力
        return this.people.map(person => {
            // 基础影响力计算
            let influence = 0;
            
            // 1. 根据职位计算基础分
            const positionScores = {
                '总经理': 100,
                '副总经理': 80,
                '总监': 60,
                '经理': 40,
                '主管': 30
            };
            influence += positionScores[person.position] || 20;
            
            // 2. 根据关联事件数量增加分数
            const relatedEvents = this.events.filter(event => 
                event.relatedPersons && event.relatedPersons.includes(person.id)
            ).length;
            influence += relatedEvents * 10;
            
            // 3. 根据部门重要性加分
            const deptScores = {
                '总经办': 50,
                '财务部': 40,
                '人事部': 30,
                '运营部': 35
            };
            influence += deptScores[person.department] || 20;
            
            return {
                name: person.name,
                influence: influence
            };
        }).sort((a, b) => b.influence - a.influence); // 按影响力降序排序
    }

    // 添加政治分析数据相关方法
    savePoliticsAnalysisData(data) {
        try {
            // 在保存前处理循环引用
            const safeData = this.removeCircularReferences(data);
            this.politicsAnalysisData = { ...this.politicsAnalysisData, ...safeData };
            this.saveData();
        } catch (error) {
            console.error('保存政治分析数据失败:', error);
        }
    }

    getPoliticsAnalysisData() {
        return this.politicsAnalysisData;
    }

    saveSelectedItems(selectedEvents, selectedPeople) {
        this.politicsAnalysisData.selectedEvents = selectedEvents;
        this.politicsAnalysisData.selectedPeople = selectedPeople;
        this.saveData();
    }
}

// 创建全局存储实例
const store = new Store(); 
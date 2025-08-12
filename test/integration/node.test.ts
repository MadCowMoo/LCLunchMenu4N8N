import { IExecuteFunctions, INode, INodeExecutionData, NodeOperationError, WorkflowExecuteMode } from 'n8n-workflow';
import { LunchMenu } from '../../src/nodes/LunchMenu/LunchMenu.node';
import { MenuService } from '../../src/utils/menuService';

const { mockFetchMenuData, mockGetMenuForDate } = jest.requireMock('../../src/utils/menuService');
jest.mock('../../src/utils/menuService');

class MockExecuteFunctions implements IExecuteFunctions {
    _node: INode;
    _items: INodeExecutionData[];

    constructor(node: INode, items: INodeExecutionData[] = []) {
        this._node = { ...node, parameters: {} };
        this._items = items;
    }

    helpers: any = {
        constructExecutionMetaData: jest.fn((items) => items),
        returnJsonArray: jest.fn().mockImplementation(data => (Array.isArray(data) ? data.map(json => ({ json })) : [{ json: data }])),
        httpRequest: jest.fn(),
        request: jest.fn(),
        requestWithAuthentication: jest.fn(),
        getAuthorizationUri: jest.fn(),
        getOAuth2AdditionalParameters: jest.fn(),
        poll: jest.fn(),
    };
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn(), warn: jest.fn(), verbose: jest.fn() };

    continueOnFail = () => true;
    getCredentials = jest.fn().mockResolvedValue({});
    getCredentialsProperties = jest.fn();
    getNode = () => this._node;
    getNodeParameter = (name: string, index = 0, fallback?: any): any => this._node.parameters[name] ?? fallback;
    getInputData = (inputIndex = 0) => this._items;
    getExecutionId = () => 'test-execution-id';
    getTimezone = () => 'UTC';
    getWorkflow = jest.fn();
    getWorkflowStaticData = jest.fn();
    getRestApiUrl = jest.fn().mockReturnValue('');
    getWebhookUrl = jest.fn().mockReturnValue('');
    getWebhookTestUrl = jest.fn().mockReturnValue('');
    getBinaryData = jest.fn();
    setBinaryData = jest.fn();
    getCorrelationId = jest.fn().mockReturnValue('test-correlation-id');
    getWorkflowExecutionId = jest.fn().mockReturnValue('test-workflow-execution-id');
    getWorkflowId = jest.fn().mockReturnValue('test-workflow-id');
    getInstanceBaseUrl = jest.fn().mockReturnValue('');
    getInstanceId = jest.fn().mockReturnValue('test-instance-id');
    getChildNodes = jest.fn().mockReturnValue([]);
    getParentNodes = jest.fn().mockReturnValue([]);
    getNodes = jest.fn().mockReturnValue([]);
    getNodeExecution = jest.fn().mockReturnValue(null);
    getKnownNodeTypes = jest.fn().mockReturnValue([]);
    getChatTrigger = jest.fn().mockReturnValue(undefined);
    getMode = (): WorkflowExecuteMode => 'run' as WorkflowExecuteMode;
    prepareOutputData = (data: INodeExecutionData[]) => Promise.resolve([data]);
    setNodeParameter = (name: string, value: any, itemIndex = 0) => { this._node.parameters[name] = value; };
    setMetadata = jest.fn();
    evaluateExpression = jest.fn();
    getContext = jest.fn().mockReturnValue({});
    getExecuteData = jest.fn().mockReturnValue({});
    getWorkflowNode = jest.fn();
    getWorkflowPinData = jest.fn();
    getNodeWebhookUrl = jest.fn();
    getPinData = jest.fn();
    logAiEvent = jest.fn();
    getWorkflowDataProxy = jest.fn();
    getInputSourceData = jest.fn();
    getExecutionCancelSignal = jest.fn();
    onExecutionCancellation = jest.fn();
    executeWorkflow = jest.fn();
    getExecutionDataById = jest.fn();
    getInputConnectionData = jest.fn();
    getNodeInputs = jest.fn();
    getConnections = jest.fn();
    getNodesByName = jest.fn();
    getNodesByType = jest.fn();
    getOutputIndex = jest.fn();
    getWorkflowExecutions = jest.fn();
    getWorkflowExecution = jest.fn();
    getWorkflowExecutionData = jest.fn();
    getWorkflowInfo = jest.fn();
    getWorkflowIsSaveable = jest.fn();
    getWorkflowIsChanged = jest.fn();
    getWorkflowIsActive = jest.fn();
    startJob = jest.fn();
    getNodeOutputs = jest.fn();
    putExecutionToWait = jest.fn();
    sendMessageToUI = jest.fn();
    sendResponse = jest.fn();
    sendChunk = jest.fn();
    isStreaming = jest.fn();
    addInputData = jest.fn();
    addOutputData = jest.fn();
    getExecuteAdditionalData = jest.fn();
    getHookUrl = jest.fn();
    getNodeAccess = jest.fn();
    addExecutionHints = jest.fn();
    nodeHelpers = {} as any;
    getParentCallbackManager = jest.fn();
}

describe('Generic Node Tests', () => {
    let lunchMenu: LunchMenu;
    let mockExecuteFunctions: MockExecuteFunctions;

    beforeEach(() => {
        lunchMenu = new LunchMenu();
        const node: INode = { id: 'test-node', name: 'LC Lunch Menu', type: 'n8n-nodes-lunchmenu.lunchMenu', typeVersion: 1, position: [0, 0], parameters: {}, credentials: {} };
        mockExecuteFunctions = new MockExecuteFunctions(node, [{ json: {} }]);

        (MenuService as jest.Mock).mockClear();
        mockFetchMenuData.mockClear();
        mockGetMenuForDate.mockClear();
    });

    it('should call fetchMenuData for the getMenu operation', async () => {
        mockExecuteFunctions.setNodeParameter('operation', 'getMenu');
        mockExecuteFunctions.setNodeParameter('startDate', '2024-01-01');
        mockExecuteFunctions.setNodeParameter('endDate', '2024-01-07');

        mockFetchMenuData.mockResolvedValue({ servingSessions: [] });

        await lunchMenu.execute.call(mockExecuteFunctions);

        expect(mockFetchMenuData).toHaveBeenCalled();
    });

    it('should call getMenuForDate for the getMenuForDate operation', async () => {
        mockExecuteFunctions.setNodeParameter('operation', 'getMenuForDate');
        mockExecuteFunctions.setNodeParameter('targetDate', '2024-01-01');
        mockExecuteFunctions.setNodeParameter('servingSessionId', 'session1');

        const mockMenuData = { servingSessions: [], startDate: '', endDate: '' };
        mockFetchMenuData.mockResolvedValue(mockMenuData);
        mockGetMenuForDate.mockReturnValue([]);

        await lunchMenu.execute.call(mockExecuteFunctions);

        expect(mockGetMenuForDate).toHaveBeenCalledWith(new Date('2024-01-01T00:00:00.000Z'), 'session1');
    });

    it('should throw a NodeOperationError for invalid date ranges', async () => {
        mockExecuteFunctions.setNodeParameter('operation', 'getMenu');
        mockExecuteFunctions.setNodeParameter('startDate', '2024-01-07');
        mockExecuteFunctions.setNodeParameter('endDate', '2024-01-01');

        const result = await lunchMenu.execute.call(mockExecuteFunctions);
        const responseData = result[0][0].json;
        expect(responseData.error).toContain('Start date cannot be after end date');
    });

    it('should return an error for an invalid operation', async () => {
        mockExecuteFunctions.setNodeParameter('operation', 'invalidOperation');

        const result = await lunchMenu.execute.call(mockExecuteFunctions);

        const responseData = result[0][0].json;
        expect(responseData).toHaveProperty('error');
        expect(responseData.error).toContain("The operation 'invalidOperation' is not supported.");
    });
});

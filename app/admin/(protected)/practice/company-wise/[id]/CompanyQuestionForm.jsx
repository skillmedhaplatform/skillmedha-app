import React, { useState } from 'react';
import { Form, Input, Select, Button, Radio, Checkbox, Space, Card, Divider, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function CompanyQuestionForm({ onAddQuestion }) {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState('Single Choice');

  const onTypeChange = (value) => {
    setQuestionType(value);
    // Reset specific fields when type changes
    form.setFieldsValue({ options: [], testCases: [] });
  };

  const handleFinish = (values) => {
    // Generate an ID for the mock
    const newQuestion = {
      id: Date.now().toString(),
      type: values.type,
      category: values.category ? values.category.join(", ") : "Uncategorized",
      difficulty: values.difficulty,
      questionText: values.questionText || values.problemStatement,
    };
    onAddQuestion(newQuestion);
    form.resetFields();
    setQuestionType('Single Choice');
  };

  return (
    <div className="max-w-[900px] mx-auto pb-10">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ type: 'Single Choice', difficulty: 'Medium', category: [] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Form.Item 
            name="type" 
            label="Question Type" 
            rules={[{ required: true }]}
          >
            <Select onChange={onTypeChange}>
              <Select.Option value="Single Choice">Single Choice</Select.Option>
              <Select.Option value="Multiple Choice">Multiple Choice</Select.Option>
              <Select.Option value="True or False">True or False</Select.Option>
              <Select.Option value="Coding">Coding</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="category" 
            label="Category" 
            rules={[{ required: true, message: 'Select or add a category' }]}
            tooltip="Type a category and press Enter to create a new one"
          >
            <Select 
              mode="tags" 
              placeholder="e.g. Quant, Coding, Reasoning" 
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item 
            name="difficulty" 
            label="Difficulty" 
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Easy">Easy</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="Hard">Hard</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Divider />

        {/* --- OBJECTIVE QUESTION FORMATS --- */}
        {questionType !== 'Coding' && (
          <>
            <Form.Item 
              name="questionText" 
              label="Question Text" 
              rules={[{ required: true, message: 'Question text is required' }]}
            >
              <TextArea rows={4} placeholder="Enter your question here..." />
            </Form.Item>

            {questionType === 'True or False' && (
              <Form.Item 
                name="correctAnswer" 
                label="Correct Answer" 
                rules={[{ required: true, message: 'Please select the correct answer' }]}
              >
                <Radio.Group>
                  <Radio value="True">True</Radio>
                  <Radio value="False">False</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            {(questionType === 'Single Choice' || questionType === 'Multiple Choice') && (
              <Card title="Options & Correct Answer" size="small" className="bg-gray-50/50">
                <Form.List 
                  name="options"
                  rules={[
                    {
                      validator: async (_, options) => {
                        if (!options || options.length < 2) {
                          return Promise.reject(new Error('At least 2 options are required'));
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }, { errors }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={field.key} className="flex gap-4 items-start mb-4">
                          <div className="pt-2 font-bold text-gray-500">Option {index + 1}:</div>
                          <div className="flex-1">
                            <Form.Item
                              {...field}
                              name={[field.name, 'text']}
                              rules={[{ required: true, message: 'Missing option text' }]}
                              className="mb-0"
                            >
                              <Input placeholder="Option text" />
                            </Form.Item>
                          </div>
                          
                          {/* We use a checkbox for multiple choice, or radio-like behavior for single choice (handled via custom UI or form logic) */}
                          <div className="pt-1 flex items-center gap-4">
                            <Form.Item
                              {...field}
                              name={[field.name, 'isCorrect']}
                              valuePropName="checked"
                              className="mb-0"
                            >
                              <Checkbox>Correct Answer</Checkbox>
                            </Form.Item>
                            
                            <MinusCircleOutlined 
                              className="text-red-500 hover:text-red-700 mt-1" 
                              onClick={() => remove(field.name)} 
                            />
                          </div>
                        </div>
                      ))}
                      <Form.Item className="mb-0">
                        <Button 
                          type="dashed" 
                          onClick={() => add()} 
                          block 
                          icon={<PlusOutlined />}
                        >
                          Add Option
                        </Button>
                        <Form.ErrorList errors={errors} />
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Card>
            )}
          </>
        )}

        {/* --- CODING QUESTION FORMAT --- */}
        {questionType === 'Coding' && (
          <div className="flex flex-col gap-6">
            <Form.Item 
              name="problemStatement" 
              label={<span className="font-semibold text-[15px]">Problem Statement</span>} 
              rules={[{ required: true, message: 'Required' }]}
            >
              <TextArea rows={4} placeholder="Clearly describe the coding problem..." />
            </Form.Item>

            <Form.Item 
              name="explanation" 
              label={<span className="font-semibold text-[15px]">Explanation with Constraints</span>}
              rules={[{ required: true, message: 'Required' }]}
            >
              <TextArea rows={3} placeholder="Explain the rules, time/space constraints, edge cases..." />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item 
                name="sampleInput" 
                label={<span className="font-semibold text-[15px]">Sample Input</span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <TextArea rows={3} placeholder="e.g. 5\n1 2 3 4 5" className="font-mono text-sm" />
              </Form.Item>

              <Form.Item 
                name="sampleOutput" 
                label={<span className="font-semibold text-[15px]">Sample Output</span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <TextArea rows={3} placeholder="e.g. 15" className="font-mono text-sm" />
              </Form.Item>
            </div>

            <Card 
              title={<span className="font-semibold text-[15px]">Hidden Test Cases</span>} 
              size="small" 
              className="bg-gray-50/50 mt-2"
            >
              <Text type="secondary" className="block mb-4">
                These test cases will be executed against the user's code but will not be shown to them.
              </Text>

              <Form.List name="testCases">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Card 
                        key={field.key} 
                        size="small" 
                        className="mb-4 shadow-sm border border-gray-200"
                        title={<Text strong className="text-gray-600">Test Case #{index + 1}</Text>}
                        extra={
                          <Button 
                            type="text" 
                            danger 
                            icon={<MinusCircleOutlined />} 
                            onClick={() => remove(field.name)}
                          >
                            Remove
                          </Button>
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            {...field}
                            label="Input"
                            name={[field.name, 'input']}
                            rules={[{ required: true, message: 'Input required' }]}
                            className="mb-0"
                          >
                            <TextArea rows={2} className="font-mono text-xs" />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            label="Expected Output"
                            name={[field.name, 'output']}
                            rules={[{ required: true, message: 'Output required' }]}
                            className="mb-0"
                          >
                            <TextArea rows={2} className="font-mono text-xs" />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Hidden Test Case
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
            style={{ background: '#1E69DA' }}
          >
            Save Question
          </Button>
        </div>
      </Form>
    </div>
  );
}

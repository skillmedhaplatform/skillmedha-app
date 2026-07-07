import json

filepath = '/Users/yasaswiasrith/.gemini/antigravity-ide/brain/d942d89f-6199-4141-81a8-b5c3ca6545b0/.system_generated/logs/transcript_full.jsonl'

targets = [
    '/Users/yasaswiasrith/Desktop/SMP1.0/skillmedha-app/app/student/(protected)/dashboard/page.js'
]

edits = []

try:
    with open(filepath, 'r') as f:
        for line in f:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call.get('name') == 'replace_file_content':
                        args = call.get('args', {})
                        target = args.get('TargetFile', '')
                        if target in targets:
                            edits.append({
                                'file': target,
                                'target': args.get('TargetContent', ''),
                                'replacement': args.get('ReplacementContent', '')
                            })
                    elif call.get('name') == 'multi_replace_file_content':
                        args = call.get('args', {})
                        target = args.get('TargetFile', '')
                        if target in targets:
                            chunks = args.get('ReplacementChunks', [])
                            if isinstance(chunks, str): chunks = json.loads(chunks)
                            for chunk in chunks:
                                edits.append({
                                    'file': target,
                                    'target': chunk.get('TargetContent', ''),
                                    'replacement': chunk.get('ReplacementContent', '')
                                })
except Exception as e:
    pass

applied = 0
for edit in edits:
    target_file = edit['file']
    try:
        with open(target_file, 'r') as f:
            content = f.read()
        if edit['target'] in content:
            content = content.replace(edit['target'], edit['replacement'])
            with open(target_file, 'w') as f:
                f.write(content)
            applied += 1
    except Exception as e:
        pass
print('Applied edits:', applied, '/', len(edits))

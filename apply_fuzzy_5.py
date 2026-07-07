import json
import difflib

def apply_fuzzy(filepath, target_file_pattern, actual_target_file):
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
                            if target_file_pattern in target:
                                edits.append({
                                    'target': args.get('TargetContent', ''),
                                    'replacement': args.get('ReplacementContent', '')
                                })
                        elif call.get('name') == 'multi_replace_file_content':
                            args = call.get('args', {})
                            target = args.get('TargetFile', '')
                            if target_file_pattern in target:
                                chunks = args.get('ReplacementChunks', [])
                                if isinstance(chunks, str): chunks = json.loads(chunks)
                                for chunk in chunks:
                                    edits.append({
                                        'target': chunk.get('TargetContent', ''),
                                        'replacement': chunk.get('ReplacementContent', '')
                                    })
    except Exception as e: pass

    if not edits: return

    with open(actual_target_file, 'r') as f:
        content = f.read()

    applied = 0
    for edit in edits:
        if edit['target'] in content:
            content = content.replace(edit['target'], edit['replacement'])
            applied += 1
        else:
            lines = content.split('\n')
            target_lines = edit['target'].split('\n')
            
            best_ratio = 0
            best_idx = -1
            
            first_line_target = target_lines[0].strip()
            for i in range(len(lines) - len(target_lines) + 1):
                if first_line_target and first_line_target not in lines[i]:
                    continue
                chunk = '\n'.join(lines[i:i+len(target_lines)])
                ratio = difflib.SequenceMatcher(None, chunk, edit['target']).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_idx = i
                    if ratio > 0.95: break
                    
            if best_ratio > 0.70:
                content_lines = content.split('\n')
                del content_lines[best_idx:best_idx+len(target_lines)]
                content_lines.insert(best_idx, edit['replacement'])
                content = '\n'.join(content_lines)
                applied += 1

    with open(actual_target_file, 'w') as f:
        f.write(content)

    print(f'Applied {applied} / {len(edits)} to {actual_target_file}')

apply_fuzzy('/Users/yasaswiasrith/.gemini/antigravity-ide/brain/cae127a5-5941-487e-83ed-18a725b17622/.system_generated/logs/transcript_full.jsonl', 'app/student/(protected)/tests/page.js', '/Users/yasaswiasrith/Desktop/SMP1.0/skillmedha-app/app/student/(protected)/tests/page.js')
apply_fuzzy('/Users/yasaswiasrith/.gemini/antigravity-ide/brain/cae127a5-5941-487e-83ed-18a725b17622/.system_generated/logs/transcript_full.jsonl', 'testCard.js', '/Users/yasaswiasrith/Desktop/SMP1.0/skillmedha-app/app/student/(protected)/tests/utils/testCard.js')
apply_fuzzy('/Users/yasaswiasrith/.gemini/antigravity-ide/brain/cae127a5-5941-487e-83ed-18a725b17622/.system_generated/logs/transcript_full.jsonl', 'formPage.jsx', '/Users/yasaswiasrith/Desktop/SMP1.0/skillmedha-app/app/student/(protected)/tests/[test-slug]/utils/formPage.jsx')


import llm_handler, processing, web_search

def run_workflow(stack_id: int, workflow: dict, query: str):
    nodes = {node['id']: node for node in workflow['nodes']}
    edges = workflow['edges']

    # Find the starting node
    current_node_id = None
    for node in nodes.values():
        if node['type'] == 'userQuery':
            is_target = any(edge['target'] == node['id'] for edge in edges)
            if not is_target:
                current_node_id = node['id']
                break

    if not current_node_id:
        return "Error: A 'UserQuery' node must be the start of the workflow."

    current_data = query

    while current_node_id:
        current_node = nodes[current_node_id]
        node_type = current_node['type']
        node_data = current_node['data']

        print(f"Executing node: {node_data.get('label', node_type)}")

        if node_type == 'userQuery':
            current_data = query 

        elif node_type == 'knowledgeBase':
            embedding_model = node_data.get('embeddingModel', 'models/embedding-001')
            api_key = node_data.get('embeddingApiKey', None)
            context = processing.search_in_knowledge_base(
                stack_id, current_data, embedding_model, api_key
            )
            current_data = {"query": current_data, "context": context}

        elif node_type == 'llmEngine':
            api_key = node_data.get('apiKey', None)
            model_name = node_data.get('modelName', 'gemini-2.5-flash')
            temperature = node_data.get('temperature', 0.75)

            prompt_input_query = current_data.get('query', query) if isinstance(current_data, dict) else current_data
            prompt_input_context = current_data.get('context', '') if isinstance(current_data, dict) else ''
            
            web_search_tool = node_data.get('webSearchTool', 'None')
            web_context = ""
            if web_search_tool == 'SerpAPI':
                print("--- Performing Web Search ---")
                web_context = web_search.perform_search(prompt_input_query)

            prompt_template = node_data.get('prompt',
                """
                    You are a helpful assistant. Your task is to provide a direct answer to the user's query.
                    Use the following tools and context to construct your answer.
                    If context from a PDF document is provided, prioritize it.
                    If context from a web search is provided, use it for recent information or if the PDF context is insufficient.
                    If no context is provided, or the context is not relevant, answer using your general knowledge.
                    Do not explain your own reasoning. Provide only the direct answer.

                    PDF CONTEXT:
                    {context}

                    WEB SEARCH RESULTS:
                    {web_context}

                    USER QUERY:
                    {query}
                """                                
            )

            final_prompt = prompt_template.format(
                query=prompt_input_query, 
                context=prompt_input_context,
                web_context=web_context
            )

            print(final_prompt)

            response = llm_handler.generate_response(
                prompt=final_prompt,
                api_key=api_key,
                model_name=model_name,
                temperature=temperature
            )
            current_data = response

        elif node_type == 'output':
            pass

        next_edge = next((edge for edge in edges if edge['source'] == current_node_id), None)
        current_node_id = next_edge['target'] if next_edge else None

    return current_data
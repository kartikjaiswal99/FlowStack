def validate_workflow(workflow: dict):
    nodes = workflow.get('nodes', [])
    edges = workflow.get('edges', [])

    if not nodes:
        return False, "Workflow cannot be empty."

    # Find all nodes that don't have an incoming connection 
    node_ids_with_inputs = {edge['target'] for edge in edges}
    start_nodes = [node for node in nodes if node['id'] not in node_ids_with_inputs]

    # There should be exactly one start node, and it must be a UserQuery node
    if len(start_nodes) != 1:
        return False, f"Workflow must have exactly one starting point. Found {len(start_nodes)}."
    
    if start_nodes[0]['type'] != 'userQuery':
        return False, "The starting node must be a 'User Query' node."


    # Check for nodes that are not connected to anything
    if len(nodes) > 1 and not edges:
         return False, "There are multiple nodes but no connections."

    end_nodes = [n for n in nodes if n['type'] == 'output' and not any(e['source'] == n['id'] for e in edges)]
    
    # If this list of endpoints is empty, validation fails.
    if not end_nodes:
        return False, "Workflow must have at least one Output node."

    return True, "Workflow is valid."
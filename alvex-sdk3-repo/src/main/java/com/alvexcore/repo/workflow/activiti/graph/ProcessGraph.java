package com.alvexcore.repo.workflow.activiti.graph;

import org.activiti.bpmn.model.*;
import org.activiti.bpmn.model.Process;
import org.alfresco.error.AlfrescoRuntimeException;

import java.util.*;
import java.util.stream.Collectors;

public class ProcessGraph {
    private final StartEvent startEvent;
    Map<String, List<String>> graph = new HashMap<>();
    Map<String, FlowElement> elements = new HashMap<>();

    public ProcessGraph(Process process) {
        List<StartEvent> startEvents = process.getFlowElements().stream()
                .filter(el -> el instanceof StartEvent)
                .map(el -> (StartEvent)el)
                .collect(Collectors.toList());

        if (startEvents.size() != 1)
            throw new AlfrescoRuntimeException(String.format("Expected only one StartEvent, got: %d", startEvents.size()));

        startEvent = startEvents.get(0);

        processElements(process);
    }

    private String getSubprocessStartId(String id)
    {
        return id + "___START";
    }

    private String getSubprocessEndId(String id)
    {
        return id + "___END";
    }

    private void parseSubprocess(SubProcess subProcess)
    {
        String startId = getSubprocessStartId(subProcess.getId());
        String endId = getSubprocessEndId(subProcess.getId());

        putElement(null, startId);
        putElement(null, endId);

        Collection<FlowElement> elements = subProcess.getFlowElements();

        processElements(subProcess);

        elements.stream()
                .filter(e -> e instanceof StartEvent)
                .forEachOrdered(e -> putEdge(startId, e.getId()));
        elements.stream()
                .filter(e -> e instanceof EndEvent)
                .forEachOrdered(e -> putEdge(e.getId(), endId));
    }

    private void putEdge(String source, String target)
    {
        List<String> edges = graph.get(source);

        if (source == null || !graph.containsKey(target))
            throw new AlfrescoRuntimeException(String.format("Found hanging sequence flow %s → %s", source, target));

        edges.add(target);
    }

    private void parseSequenceFlow(SequenceFlow sequenceFlow, FlowElementsContainer container)
    {
        String source = sequenceFlow.getSourceRef();
        String target = sequenceFlow.getTargetRef();

        if (container.getFlowElement(source) instanceof SubProcess)
            source = getSubprocessEndId(source);
        else if (container.getFlowElement(target) instanceof SubProcess)
            target = getSubprocessStartId(target);

        putEdge(source, target);
    }

    private void parseFlowElement(FlowElement flowElement)
    {
        String id = flowElement.getId();
        putElement(flowElement, null);
    }

    private void putElement(FlowElement element, String id) {
        String _id = element == null ? id : element.getId();
        if (graph.containsKey(_id))
            throw new AlfrescoRuntimeException("Found duplicate element: " + _id);

        graph.put(_id, new ArrayList<>());
        elements.put(_id, element);
    }

    private void processElements(FlowElementsContainer container) {
        for (FlowElement el: sortedElements(container.getFlowElements()))
        {
            if (el instanceof SequenceFlow)
                parseSequenceFlow((SequenceFlow) el, container);
            else if (el instanceof SubProcess)
                parseSubprocess((SubProcess) el);
            else
                parseFlowElement(el);
        }
    }

    private List<FlowElement> sortedElements(Collection<FlowElement> flowElements) {
        List<FlowElement> sorted = new ArrayList<>(flowElements);
        sorted.sort((t1, t2) -> {
            if (t1 instanceof SequenceFlow && !(t2 instanceof SequenceFlow))
                return 1;
            else if (t2 instanceof SequenceFlow && !(t1 instanceof SequenceFlow))
                return -1;
            else
                return t1.getId().compareTo(t2.getId());
        });

        return sorted;
    }

    public List<UserTask> getUserTasks()
    {
        return elements.values().stream()
                .filter(el -> el instanceof UserTask)
                .map(el -> (UserTask)el)
                .collect(Collectors.toList());
    }

    public Map<String, Integer> bfs(String startNode, Class nodeClass, Integer maxDistance)
    {
        if (maxDistance == null || maxDistance < 1)
            maxDistance = Integer.MAX_VALUE;

        if (nodeClass == null)
            nodeClass = FlowNode.class;

        if (startNode == null)
            startNode = startEvent.getId();

        Map<String, Integer> distances = new HashMap<>();
        distances.put(startNode, 0);

        LinkedList<String> queue = new LinkedList<>();
        queue.add(startNode);

        Set<String> used = new HashSet<>();
        used.add(startNode);

        while (!queue.isEmpty())
        {
            String currentNode = queue.pop();
            Integer dist = distances.get(currentNode);

            for (String neighbour: graph.get(currentNode))
                if (!used.contains(neighbour) && dist < maxDistance)
                {
                    FlowElement element = elements.get(neighbour);
                    used.add(neighbour);
                    queue.add(neighbour);
                    distances.put(neighbour, dist + (nodeClass.isInstance(element) ? 1 : 0));
                }
        }

        return distances;
    }

    public FlowElement getElementById(String id)
    {
        return elements.get(id);
    }
}

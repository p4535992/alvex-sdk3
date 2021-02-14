package com.alvexcore.repo.bcal.jobs;

import com.alvexcore.repo.RepositoryExtensionRegistry;
import com.alvexcore.repo.bcal.AbstractBusinessCalendarHandler;
import com.alvexcore.repo.bcal.BusinessCalendar;
import com.alvexcore.repo.kvstore.KeyValueStoreAware;
import org.activiti.engine.ActivitiObjectNotFoundException;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.TaskService;
import org.activiti.engine.repository.ProcessDefinition;
import org.activiti.engine.task.Task;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.repo.security.authentication.AuthenticationUtil.RunAsWork;
import org.alfresco.repo.tenant.TenantUtil;
import org.alfresco.repo.workflow.WorkflowModel;
import org.alfresco.repo.workflow.WorkflowNotificationUtils;
import org.alfresco.service.cmr.notification.NotificationContext;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.workflow.WorkflowTask;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Required;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentMap;

public class SendTaskNotificationsJobExecuter extends KeyValueStoreAware {

    protected final static Log logger = LogFactory.getLog(SendTaskNotificationsJobExecuter.class);
    public static final String LAST_RUN = "alvex.bcal.notifications.lastRun";

    private RepositoryService repositoryService;
    private TaskService taskService;

    private BusinessCalendar businessCalendar;
    private AbstractBusinessCalendarHandler handler;

    private int deadline;
    private ConcurrentMap<String, LocalDate> alvexGlobalKVS;
    
    //MOD 4535992
    private Properties globalProperties;
    private final String ALVEX_BCAL_JOBS_SENDNOTIFICATIONS_ENABLE = "alvex.bcal.jobs.sendNotifications.enable";

    @Required
    public void setBusinessCalendar(BusinessCalendar businessCalendar) {
        this.businessCalendar = businessCalendar;
        handler = businessCalendar.getHandler();
    }

    @Required
    public void setRepositoryService(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @Required
    public void setTaskService(TaskService taskService) {
        this.taskService = taskService;
    }

    @Required
    public void setDeadline(int deadline) {
        this.deadline = deadline;
    }

    public void setGlobalProperties(Properties globalProperties) {
		this.globalProperties = globalProperties;
	}

	void execute() {
		
		//MOD 4535992 ENABLE/DISABLE SEND OF EMAIL
		
		if(globalProperties.get(ALVEX_BCAL_JOBS_SENDNOTIFICATIONS_ENABLE)!=null && Boolean.parseBoolean(String.valueOf(globalProperties.get(ALVEX_BCAL_JOBS_SENDNOTIFICATIONS_ENABLE)))) {
		
	        LocalDate now = LocalDate.now();
	
	        LocalDate lastRun = alvexGlobalKVS.get(LAST_RUN);
	
	        if (now.equals(lastRun))
	        {
	            logger.info("All notifications already sent, skipping");
	            return;
	        }
	
	        logger.info("Sending email notifications");
	
	
	        List<String> matches = handler.getMatches();
	
	        int counter = 0;
	
	        for (ProcessDefinition def: repositoryService.createProcessDefinitionQuery().list())
	        {
	            if (!matches.stream().anyMatch(p -> def.getKey().matches(p)))
	                continue;
	
	            for (Task task: taskService.createTaskQuery().processDefinitionId(def.getId()).list())
	            {
	                try{
	                    Date _dueDate = task.getDueDate();
	                    if (_dueDate == null)
	                        continue;
	
	                    LocalDate dueDate = _dueDate.toInstant().atOffset(businessCalendar.getZoneOffset()).toLocalDate();
	                    if (dueDate.isBefore(now)) {
	                        businessCalendar.onTaskOverdue(task);
	                        counter++;
	                    }
	                    else
	                        if (dueDate.equals(now))
	                        {
	                            businessCalendar.onTaskDeadlineToday(task);
	                            counter++;
	                        }
	                        else
	                        {
	                            LocalDate deadlineDate = businessCalendar.getDeadlineDate(dueDate, deadline);
	                            if (deadlineDate.isBefore(now)) {
	                                businessCalendar.onTaskDeadlineApproaching(task);
	                                counter++;
	                            }
	                        }
	
	                } catch (ActivitiObjectNotFoundException e)
	                {
	                    logger.error("Error occurred while sending notifications", e);
	                }
	            }
	        }
	
	        logger.info(String.format("%d email notifications sent", counter));
	
	        alvexGlobalKVS.put(LAST_RUN, now);
		}
		//MOD 4535992 INVIO EMAIL STANDARD
//		else {
//			AuthenticationUtil.runAs(new RunAsWork<Void>() {
//			    public Void doWork() throws Exception {
//			        //
//			        // make the assignment
//			        //
//			        Boolean sendEMailNotification = (Boolean)finalExecutionContext.getVariable(WorkflowNotificationUtils.PROP_SEND_EMAIL_NOTIFICATIONS);
//			        if (finalAssignedActor != null)
//			        {
//			            assignable.setActorId(finalAssignedActor);
//
//			            if (Boolean.TRUE.equals(sendEMailNotification) == true)
//			            {
//			                // Send the notification
//			                WorkflowNotificationUtils.sendWorkflowAssignedNotificationEMail(
//			                            services, 
//			                            JBPMEngine.ENGINE_ID + "$" + finalExecutionContext.getTaskInstance().getId(),
//			                            finalAssignedActor,
//			                            false);
//			            }
//
//			        }
//			        if (finalAssignedPooledActors != null)
//			        {
//			            assignable.setPooledActors(finalAssignedPooledActors);
//
//			            if (Boolean.TRUE.equals(sendEMailNotification) == true)
//			            {
//			                // Send the notification
//			                WorkflowNotificationUtils.sendWorkflowAssignedNotificationEMail(
//			                        services, 
//			                        JBPMEngine.ENGINE_ID + "$" + finalExecutionContext.getTaskInstance().getId(),
//			                        finalAssignedPooledActors,
//			                        true);
//			            }
//			        }         
//
//			        return null;
//			    }
//
//			}, AuthenticationUtil.getSystemUserName());
//		}
    }

    @Override
    protected void onKeyValueStoreReady() {
        alvexGlobalKVS = keyValueStore.getStore(RepositoryExtensionRegistry.ALVEX_GLOBAL_KEY_VALUE_STORE);
    }
    
    
    // =============================================================================================================
    // MOD 4535992
    // ============================================================================================================
    
//   /**
//    *
//    * @param taskId String
//    * @param taskTitle String
//    * @param description String
//    * @param dueDate Date
//    * @param priority Integer
//    * @param workflowPackage NodeRef
//    * @param assignedAuthorites String[]
//    * @param pooled boolean
//    */
//   public void sendWorkflowAssignedNotificationEMail(
//           String taskId,
//           String taskTitle,
//           String description,
//           Date dueDate,
//           Integer priority,
//           NodeRef workflowPackage,
//           String[] assignedAuthorites,
//           boolean pooled)
//   {
//       NotificationContext notificationContext = new NotificationContext();
//       
//       // Determine the subject of the notification
//       String subject = null;
//       if (pooled == false)
//       {            
//           subject = WorkflowNotificationUtils.MSG_ASSIGNED_TASK;
//       }
//       else
//       {
//           subject = WorkflowNotificationUtils.MSG_NEW_POOLED_TASK;
//       }
//       notificationContext.setSubject(subject);
//       
//       // Set the email template
//       notificationContext.setBodyTemplate(WorkflowNotificationUtils.WF_ASSIGNED_TEMPLATE);
//       
//       // Build the template args
//       Map<String, Serializable>templateArgs = new HashMap<String, Serializable>(7);
//       templateArgs.put(WorkflowNotificationUtils.ARG_WF_ID, taskId);
//       templateArgs.put(WorkflowNotificationUtils.ARG_WF_TITLE, taskTitle);
//       templateArgs.put(WorkflowNotificationUtils.ARG_WF_DESCRIPTION, description);
//       if (dueDate != null)
//       {
//           templateArgs.put(WorkflowNotificationUtils.ARG_WF_DUEDATE, dueDate);
//       }
//       if (priority != null)
//       {
//           templateArgs.put(WorkflowNotificationUtils.ARG_WF_PRIORITY, priority);
//       }
//       
//       // Indicate whether this is a pooled workflow item or not
//       templateArgs.put(WorkflowNotificationUtils.ARG_WF_POOLED, pooled);
//       
//       if (workflowPackage != null)
//       {
//           // Add details of associated content
//           List<ChildAssociationRef> assocs = nodeService.getChildAssocs(workflowPackage);
//           NodeRef[] docs = new NodeRef[assocs.size()];
//           if (assocs.size() != 0)
//           {
//               int index = 0;
//               for (ChildAssociationRef assoc : assocs)
//               {
//                   docs[index] = assoc.getChildRef();
//                   index++;
//               }
//               templateArgs.put(WorkflowNotificationUtils.ARG_WF_DOCUMENTS, docs);
//           }
//       }
//       
//       // Add tenant, if in context of tenant
//       String tenant = TenantUtil.getCurrentDomain();
//       if (tenant != null)
//       {
//           templateArgs.put(WorkflowNotificationUtils.ARG_WF_TENANT, tenant);
//       }
//       
//       // Set the template args
//       notificationContext.setTemplateArgs(templateArgs);
//       
//       // Set the notification recipients
//      for (String assignedAuthority : assignedAuthorites)
//      {
//         notificationContext.addTo(assignedAuthority);
//      }
//      
//      // Indicate that we want to execute the notification asynchronously
//      notificationContext.setAsyncNotification(true);
//       
//      // Send email notification
//      //notificationService.sendNotification(EMailNotificationProvider.NAME, notificationContext);
//   }
//   
//   /**
//    * Send workflow assigned email notification.
//    * 
//    * @param taskId                workflow global task id
//    * @param taskType              task type
//    * @param assignedAuthorites    assigned authorities
//    * @param pooled                true if pooled task, false otherwise
//    */
//   public void sendWorkflowAssignedNotificationEMail(String taskId, String taskType, String[] assignedAuthorites, boolean pooled)
//   {                
//       // Get the workflow task
//       WorkflowTask workflowTask = workflowService.getTaskById(taskId);
//       
//       // Get the workflow properties
//       Map<QName, Serializable> props = workflowTask.getProperties();
//       
//       // Get the title and description
//       String title = taskType == null ? workflowTask.getTitle() : taskType + ".title";
//       String description = (String)props.get(WorkflowModel.PROP_DESCRIPTION);
//       
//       // Get the duedate, priority and workflow package
//       Date dueDate = (Date)props.get(WorkflowModel.PROP_DUE_DATE);
//       Integer priority = (Integer)props.get(WorkflowModel.PROP_PRIORITY);
//       NodeRef workflowPackage = workflowTask.getPath().getInstance().getWorkflowPackage();
//
//       // Send notification
//       sendWorkflowAssignedNotificationEMail(taskId, title, description, dueDate, priority, workflowPackage, assignedAuthorites, pooled);
//   }
//   
//   /**
//    * Send workflow assigned email notification.
//    * 
//    * @param taskId                workflow global task id
//    * @param taskType              task type
//    * @param assignedAuthority     assigned authority
//    * @param pooled                true if pooled task, false otherwise
//    */
//   public void sendWorkflowAssignedNotificationEMail(String taskId, String taskType, String assignedAuthority, boolean pooled)
//   {
//       sendWorkflowAssignedNotificationEMail(taskId, taskType, new String[]{assignedAuthority}, pooled);
//   }
}